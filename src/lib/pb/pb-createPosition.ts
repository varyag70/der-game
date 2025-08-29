// src/lib/pb-createPosition.ts
import PocketBase, { type RecordModel } from 'pocketbase';
import { assets, ASSET_IDS, type Asset } from '$lib/types';

const COLLECTION = 'pos';

export type UserPosition = RecordModel & {
  user: string;
  asset: string;               // relation id to `assets` (e.g. "rub")
  x: number;
  price?: number | null;
};

// Decimal rules: USD/RUB → 2dp, others → integer
const ASSET_DECIMALS: Record<Asset, 0 | 2> = {
  RUB: 2,
  USD: 2,
  RUB_MM_Account: 0,
  USD_MM_Account: 0,
  FORWARD: 0,
  BOND: 0,
  CALL: 0,
  PUT: 0
};

function ensureLoggedIn(pb: PocketBase) {
  if (!pb.authStore.isValid || !pb.authStore.record?.id) {
    throw new Error('Not authenticated. Please log in first.');
  }
}

function validateAsset(asset: string): Asset {
  if (!assets.includes(asset as Asset)) {
    throw new Error(`Invalid asset "${asset}". Allowed: ${assets.join(', ')}`);
  }
  return asset as Asset;
}

function hasAtMostDecimals(x: number, decimals: number): boolean {
  const scaled = Math.round(x * 10 ** decimals);
  return Number.isFinite(x) && Math.abs(x - scaled / 10 ** decimals) < 1e-10;
}

function validateXForAsset(asset: Asset, x: number): number {
  const d = ASSET_DECIMALS[asset];
  if (!Number.isFinite(x)) throw new Error('x must be a finite number.');
  if (d === 0) {
    if (!Number.isInteger(x)) throw new Error(`x must be an integer for ${asset}.`);
  } else if (!hasAtMostDecimals(x, d)) {
    throw new Error(`x must have at most ${d} decimal places for ${asset}.`);
  }
  return x;
}

/**
 * Create position: `assetInput` is ticker (e.g. "USD"), we store relation id (e.g. "usd")
 */
export async function createUserPosition(
  pb: PocketBase,
  assetInput: string,
  xInput: number
): Promise<UserPosition> {
  ensureLoggedIn(pb);
  const asset = validateAsset(assetInput);
  const x = validateXForAsset(asset, xInput);

  return pb.collection(COLLECTION).create<UserPosition>({
    user: pb.authStore.record!.id,
    asset: ASSET_IDS[asset], // relation id in `assets`
    x
  });
}

/**
 * Update only price field
 */
export async function updatePositionPrice(
  pb: PocketBase,
  positionId: string,
  price: number
): Promise<UserPosition> {
  return pb.collection(COLLECTION).update<UserPosition>(positionId, { price });
}
