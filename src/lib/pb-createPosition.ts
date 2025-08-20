// src/lib/pb-createPosition.ts
import PocketBase, { type RecordModel } from 'pocketbase';

const COLLECTION = 'user_positions';

export type Asset =
  | 'USD'
  | 'RUB'
  | 'USD_MM_Account'
  | 'RUB_MM_Account'
  | 'FORWARD'
  | 'BOND';

export type UserPosition = RecordModel & {
  user: string;
  assetName: Asset;   // ✅ matches your field
  x: number;
  price?: number | null;
  value?: number | null;
};

// Decimal rules: USD/RUB → 2dp, others → integer
const ASSET_DECIMALS: Record<Asset, 0 | 2> = {
  USD: 2,
  RUB: 2,
  USD_MM_Account: 0,
  RUB_MM_Account: 0,
  FORWARD: 0,
  BOND: 0
};

function ensureLoggedIn(pb: PocketBase) {
  if (!pb.authStore.isValid || !pb.authStore.record?.id) {
    throw new Error('Not authenticated. Please log in first.');
  }
}

function validateAsset(asset: string): Asset {
  const allowed: Asset[] = [
    'USD',
    'RUB',
    'USD_MM_Account',
    'RUB_MM_Account',
    'FORWARD',
    'BOND'
  ];
  if (!allowed.includes(asset as Asset)) {
    throw new Error(`Invalid asset "${asset}". Allowed: ${allowed.join(', ')}`);
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
 * Usage: await createUserPosition(pb, 'USD', 123.45)
 */
export async function createUserPosition(
  pb: PocketBase,
  assetInput: string,
  xInput: number
): Promise<UserPosition> {
  ensureLoggedIn(pb);
  const asset = validateAsset(assetInput);
  const x = validateXForAsset(asset, xInput);

  const rec = await pb.collection(COLLECTION).create<UserPosition>({
    user: pb.authStore.record!.id,
    assetName: asset,   // ✅ matches your PB field
    x
  });

  return rec;
}

export async function updatePositionPrice(
  pb: PocketBase,
  positionId: string,
  price: number
): Promise<UserPosition> {
  const rec = await pb.collection(COLLECTION).update<UserPosition>(positionId, {
    price,
    // assume you already stored x in the record
    value: undefined // let backend recalc, or recalc in client:
  });

  return rec;
}
