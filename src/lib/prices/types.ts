// src/lib/prices/types.ts
export const assets = [
  'RUB',
  'USD',
  'RUB_MM_Account',
  'USD_MM_Account',
  'FORWARD',
  'BOND',
  'CALL',
  'PUT'
] as const;


// before (implicitly strings)
export type PricesUnderlying = {
  USD: number; BOND: number; CALL: number; PUT: number;
};

export type Asset = typeof assets[number];

export type Underlying = 'USD' | 'BOND' | 'CALL' | 'PUT';

export type PriceSource = 'global' | 'user';

// Decimal-safe strings, RUB numeraire
//export type PricesUnderlying = Record<Underlying, string>;
export type PricesAll = Record<string, number>;

// Client snapshot (what your store exposes). Server record won’t have prices_all persisted.
export interface PriceSnapshot {
  asOf: string;
  priceVersion: number;
  priceSource: PriceSource;
  prices_underlying: PricesUnderlying;
  prices_all: PricesAll; // derived on client from prices_underlying
}



export const ASSET_IDS: Record<Asset, string> = {
  RUB: 'rub',
  USD: 'usd',
  RUB_MM_Account: 'rub_mm_account',
  USD_MM_Account: 'usd_mm_account',
  FORWARD: 'forward',
  BOND: 'bond',
  CALL: 'call',
  PUT: 'put'
} as const;


export type Positions = Record<Asset, number>;
