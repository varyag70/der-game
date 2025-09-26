// src/lib/prices/priceSnapshot.svelte.ts
import type PocketBase from 'pocketbase';
import type { PricesAll, PricesUnderlying } from '$lib/types/pricesTypes';

/** Shared rune state (stable identity; mutate properties only) */
export const priceSnapshot = $state({
  asOf: null as string | null,
  priceVersion: null as number | null,
  priceSource: null as string | null,
  prices_underlying: null as PricesUnderlying | null,
  prices_all: null as PricesAll | null
});

/** Null-safe compute helper */
function computeAllPrices(pu: PricesUnderlying | null | undefined): PricesAll | null {
  if (!pu) return null;
  const { USD: usdPx, BOND: bondPx, CALL: callPx, PUT: putPx } = pu;
  if (!usdPx || !bondPx || !callPx || !putPx) return null;

  return {
    RUB: 100,             // 1.00 RUB in kopecks
    USD: usdPx,           // already integer kopecks
    RUB_MM_Account: 100,
    USD_MM_Account: usdPx,
    FORWARD: 0,
    BOND: bondPx,
    CALL: callPx,
    PUT: putPx
  };
}



/** Minimal shape we expect from the PocketBase record */
type StateTradingRecord = Partial<{
  asOf: string;
  priceVersion: number;
  priceSource: string;
  prices_underlying: PricesUnderlying | null;
}>;

/** Gentle runtime narrowing from unknown → StateTradingRecord */
function toStateTradingRecord(x: unknown): StateTradingRecord {
  return x && typeof x === 'object' ? (x as StateTradingRecord) : {};
}

/** Apply PB record fields into our rune state (no reassignment) */
function applyRecord(rec: StateTradingRecord & { prices_ul?: PricesUnderlying }) {
  priceSnapshot.asOf = rec.asOf ?? null;
  priceSnapshot.priceVersion = rec.priceVersion ?? null;
  priceSnapshot.priceSource = rec.priceSource ?? null;

  const pu = rec.prices_underlying ?? rec.prices_ul ?? null;
  priceSnapshot.prices_underlying = pu;
  priceSnapshot.prices_all = computeAllPrices(pu);
}



let subscribed = false;

/** Subscribe for live updates to one `prices` record */
export async function subscribeStateTrading(pb: PocketBase, recordId: string) {
  // initial load
  const recUnknown = (await pb.collection('prices').getOne(recordId)) as unknown;
  applyRecord(toStateTradingRecord(recUnknown));

  // fresh realtime subscription
  try {
    await pb.collection('prices').unsubscribe();
  } catch (err) {
    console.warn('prices.unsubscribe (initial) failed (ok if first time):', err);
  }

  await pb.collection('prices').subscribe(recordId, (e: unknown) => {
    const record = (e as { record?: unknown })?.record;
    applyRecord(toStateTradingRecord(record));
  });

  subscribed = true;
}

/** Cleanup */
export async function teardownStateTrading(pb: PocketBase) {
  if (!subscribed) return;
  try {
    await pb.collection('prices').unsubscribe();
  } catch (err) {
    console.warn('prices.unsubscribe (teardown) failed:', err);
  }
  subscribed = false;
}
