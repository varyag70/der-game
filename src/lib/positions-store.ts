import { writable } from 'svelte/store';
import type PocketBase from 'pocketbase';
import { assets, ASSET_IDS, type Asset, type Positions } from '$lib/prices/types';

const COLLECTION = 'pos';

const EMPTY: Positions = Object.fromEntries(assets.map(a => [a, 0])) as Positions;

// Reverse map: id ("usd") -> Asset ("USD")
const ASSET_BY_ID: Record<string, Asset> = Object.fromEntries(
  Object.entries(ASSET_IDS).map(([asset, id]) => [id, asset as Asset])
) as Record<string, Asset>;

// shared store
export const currentPositionsStore = writable<Positions>({ ...EMPTY });

function requireUserId(pb: PocketBase) {
  const id = pb.authStore.record?.id;
  if (!id) throw new Error('Not authenticated');
  return id;
}

// load once
export async function loadCurrentPositions(pb: PocketBase) {
  const uid = requireUserId(pb);

  const rows = await pb.collection(COLLECTION).getFullList<{ user: string; asset: string; x: number }>({
    filter: `user="${uid}"`
  });

  const map: Positions = { ...EMPTY };
  for (const r of rows) {
    const a = ASSET_BY_ID[r.asset]; // relation id -> Asset key
    if (a) map[a] = Number(r.x) || 0;
  }
  currentPositionsStore.set(map);
}

// realtime subscribe
export async function subscribeCurrentPositions(pb: PocketBase) {
  const uid = requireUserId(pb);
  await pb.collection(COLLECTION).unsubscribe(); // reset any old subs

  await pb.collection(COLLECTION).subscribe(
    '*',
    (e) => {
      const rec = e.record as { user?: string; asset?: string; x?: number; id?: string } | undefined;
      if (!rec || rec.user !== uid || !rec.asset) return;

      const a = ASSET_BY_ID[rec.asset];
      if (!a) return;

      if (e.action === 'delete') {
        currentPositionsStore.update(p => ({ ...p, [a]: 0 }));
      } else {
        currentPositionsStore.update(p => ({ ...p, [a]: Number(rec.x) || 0 }));
      }
    },
    { filter: `user="${uid}"` }
  );
}

export async function stopCurrentPositionsRealtime(pb: PocketBase) {
  await pb.collection(COLLECTION).unsubscribe();
}
