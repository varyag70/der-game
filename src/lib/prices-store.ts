// src/lib/prices-store.ts
import { writable } from 'svelte/store';
import type PocketBase from 'pocketbase';
import { assets, ASSET_IDS, type Asset } from '$lib/prices/types';

export type PriceSource = 'global' | 'user';
export type Prices = Record<Asset, number | null>;

const CONFIG_COLLECTION = 'config';
const CONFIG_ID = 'app';
const ASSETS_COLLECTION = 'assets';
const USER_PRICES_COLLECTION = 'user_prices';

const EMPTY: Prices = Object.fromEntries(assets.map((a) => [a, null])) as Prices;

export const pricesStore = writable<Prices>({ ...EMPTY });
export const priceSourceStore = writable<PriceSource>('global');

// "usd" -> "USD"
const ASSET_BY_ID: Record<string, Asset> = Object.fromEntries(
  Object.entries(ASSET_IDS).map(([A, id]) => [id, A as Asset])
) as Record<string, Asset>;

function requireUserId(pb: PocketBase) {
  const id = pb.authStore.record?.id;
  if (!id) throw new Error('Not authenticated');
  return id;
}

// ---- CONFIG ---------------------------------------------------------------

async function loadPriceSource(pb: PocketBase): Promise<PriceSource> {
  const cfg = await pb.collection(CONFIG_COLLECTION).getOne<{ priceSource: PriceSource }>(CONFIG_ID);
  const src = (cfg?.priceSource ?? 'global') as PriceSource;
  priceSourceStore.set(src);
  return src;
}

async function subscribePriceSource(pb: PocketBase, onFlip: (src: PriceSource) => void) {
  await pb.collection(CONFIG_COLLECTION).unsubscribe();
  await pb.collection(CONFIG_COLLECTION).subscribe(CONFIG_ID, (e) => {
    const src = (e.record?.priceSource as PriceSource) ?? 'global';
    priceSourceStore.set(src);
    onFlip(src);
  });
}

// ---- LOADERS --------------------------------------------------------------

async function loadGlobalPrices(pb: PocketBase) {
  const rows = await pb.collection(ASSETS_COLLECTION).getFullList<{ id: string; price?: number | null }>();
  const map: Prices = { ...EMPTY };
  for (const r of rows) {
    const a = ASSET_BY_ID[r.id];
    if (a) map[a] = r.price ?? null;
  }
  pricesStore.set(map);
}

async function loadUserPrices(pb: PocketBase) {
  const uid = requireUserId(pb);
  const rows = await pb
    .collection(USER_PRICES_COLLECTION)
    .getFullList<{ user: string; asset: string; price?: number | null }>({
      filter: `user="${uid}"`
    });

  const map: Prices = { ...EMPTY };
  for (const r of rows) {
    const a = ASSET_BY_ID[r.asset];
    if (a) map[a] = r.price ?? null;
  }
  pricesStore.set(map);
}

// ---- SUBSCRIPTIONS --------------------------------------------------------

async function subscribeGlobalPrices(pb: PocketBase) {
  await pb.collection(ASSETS_COLLECTION).unsubscribe();
  await pb.collection(ASSETS_COLLECTION).subscribe('*', (e) => {
    const rec = e.record as { id?: string; price?: number | null } | undefined;
    if (!rec?.id) return;
    const a = ASSET_BY_ID[rec.id];
    if (!a) return;
    pricesStore.update((p) => ({ ...p, [a]: rec.price ?? null }));
  });
}

async function subscribeUserPrices(pb: PocketBase) {
  const uid = requireUserId(pb);
  await pb.collection(USER_PRICES_COLLECTION).unsubscribe();
  await pb.collection(USER_PRICES_COLLECTION).subscribe(
    '*',
    (e) => {
      const rec = e.record as { user?: string; asset?: string; price?: number | null } | undefined;
      if (!rec?.asset || rec.user !== uid) return;
      const a = ASSET_BY_ID[rec.asset];
      if (!a) return;

      if (e.action === 'delete') {
        pricesStore.update((p) => ({ ...p, [a]: null }));
      } else {
        pricesStore.update((p) => ({ ...p, [a]: rec.price ?? null }));
      }
    },
    { filter: `user="${uid}"` }
  );
}

// ---- PUBLIC API -----------------------------------------------------------

export async function setupPrices(pb: PocketBase) {
  const src = await loadPriceSource(pb);

  if (src === 'global') {
    await loadGlobalPrices(pb);
    await subscribeGlobalPrices(pb);
  } else {
    await loadUserPrices(pb);
    await subscribeUserPrices(pb);
  }

  // Flip at runtime when config/app.priceSource changes
  await subscribePriceSource(pb, async (next) => {
    await pb.collection(ASSETS_COLLECTION).unsubscribe();
    await pb.collection(USER_PRICES_COLLECTION).unsubscribe();

    pricesStore.set({ ...EMPTY });

    if (next === 'global') {
      await loadGlobalPrices(pb);
      await subscribeGlobalPrices(pb);
    } else {
      await loadUserPrices(pb);
      await subscribeUserPrices(pb);
    }
  });
}

export async function teardownPrices(pb: PocketBase) {
  await pb.collection(ASSETS_COLLECTION).unsubscribe();
  await pb.collection(USER_PRICES_COLLECTION).unsubscribe();
  await pb.collection(CONFIG_COLLECTION).unsubscribe();
}
