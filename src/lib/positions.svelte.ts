import type PocketBase from 'pocketbase';
import { assets, ASSET_IDS, type Asset, type Positions } from '$lib/prices/types';

const POS_COLLECTION = 'pos';

const EMPTY: Positions = Object.fromEntries(assets.map(a => [a, 0])) as Positions;

const ASSET_BY_ID: Record<string, Asset> = Object.fromEntries(
  Object.entries(ASSET_IDS).map(([asset, id]) => [id, asset as Asset])
) as Record<string, Asset>;

// Shared rune state (import directly in components)
export const positions = $state<Positions>({ ...EMPTY });

// One-shot load (no realtime here)
export async function loadPositions(pb: PocketBase) {
  const uid = pb.authStore.record?.id;
  if (!uid) {
    // not authenticated → clear to EMPTY
    for (const a of assets) positions[a] = 0;
    return;
  }

  const rows = await pb.collection(POS_COLLECTION).getFullList<{ user: string; asset: string; x: number }>({
    filter: `user="${uid}"`
  });

  const next: Positions = { ...EMPTY };
  for (const r of rows) {
    const a = ASSET_BY_ID[r.asset];
    if (a) next[a] = Number(r.x) || 0;
  }

  // commit
  for (const a of assets) positions[a] = next[a];
}
