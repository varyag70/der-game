//export type Asset = 'RUB' | 'USD' | 'FORWARD' | 'RUB_MM_Account' | 'USD_MM_Account';

// src/lib/types.ts

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

export type Asset = typeof assets[number];

export type Positions = Record<Asset, number>;

// src/lib/types.ts
export type PBError = {
  data?: {
    message?: string;
    data?: {
      username?: { code?: string };
      [key: string]: { code?: string } | undefined;
    };
  };
  message?: string;
};

export function isPBError(err: unknown): err is PBError {
  return typeof err === 'object' && err !== null && 'data' in err;
}
