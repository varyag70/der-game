<script lang="ts">
  import { pb } from '$lib/pb/pb';
  import { assets } from '$lib/types/pricesTypes';

  import { priceSnapshot, subscribeStateTrading, teardownStateTrading } from '$lib/prices/priceSnapshot.svelte';
  import { positions, loadPositions } from '$lib/positions.svelte';          // ← adjust path if needed
  import { statePosition, subscribeStatePosition, teardownStatePosition } from '$lib/statePosition.svelte';

  const STATE_TRADING_ID = '1nqm35egy808gfs';


  let selectedAsset = $state<string | null>(null); // radio group

  // 1) mount: load once + subscribe to BOTH channels; cleanup on unmount
  $effect(() => {
    void loadPositions(pb);
    void subscribeStateTrading(pb, STATE_TRADING_ID);
    void subscribeStatePosition(pb);

    return () => {
      teardownStateTrading(pb);
      teardownStatePosition(pb);
    };
  });

  // 2) reload positions on state_trading version bump
  let lastVersion = $state<number | null>(null);
  $effect(() => {
    const v = priceSnapshot.priceVersion ?? null;
    if (v !== null && v !== lastVersion) {
      lastVersion = v;
      void loadPositions(pb);
    }
  });


  const RUB = 'RUB';

  // kopecks (int) -> "### ###.##"
  const fmtRUB = (kop: number | null | undefined) => {
    if (kop == null) return '—';
    const rub = Math.trunc(kop / 100);
    const kk = Math.abs(kop % 100);
    return `${rub.toLocaleString('ru-RU')}.${kk.toString().padStart(2, '0')}`;
  };

  // positions: RUB (kopecks) uses fmtRUB; others are integers
  const fmtPos = (asset: string, x: number | null | undefined) =>
    asset === RUB ? fmtRUB(x) : x == null ? '—' : String(Math.trunc(Number(x)));

  // prices: kopecks per 1 unit -> RUB with 2dp
  const fmtPrice = (x: number | null | undefined) => fmtRUB(x);

  // (optional) sanity check: warn if a “kopecks” value isn’t integer
  const assertInt = (label: string, x: unknown) => {
    if (typeof x === 'number' && !Number.isInteger(x)) console.warn(`${label} not integer:`, x);
  };
</script>

<table class="min-w-full border border-gray-700 text-sm font-medium bg-gray-300">
  <thead class="bg-gray-200 text-gray-900">
    <tr>
      <th class="px-2 py-1 border border-gray-400 font-semibold">Asset</th>
      <th class="px-2 py-1 border border-gray-400 font-semibold">Position</th>
      <th class="px-2 py-1 border border-gray-400 font-semibold">Price</th>
    </tr>
  </thead>
  <tbody>
    {#each assets as a}
      <tr class="border-b border-gray-700 last:border-0">
        <td class="px-3 py-2">
          {#if a !== RUB}
            <input type="radio" name="asset" bind:group={selectedAsset} value={a} class="mr-2" />
          {/if}
          {a}
        </td>

        <!-- Position: integers; RUB is kopecks -->
        <td class="px-3 py-2 text-right">
          {fmtPos(a, positions[a])}
        </td>

        <!-- Price: kopecks per 1 unit -->
        <td class="px-3 py-2 text-right">
          {#if priceSnapshot?.prices_all}
            {@const px = priceSnapshot.prices_all[a]}
            {@html (assertInt(`price[${a}]`, px), '')}
            {fmtPrice(px ?? null)}
          {:else}
            —
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>


<!-- Debug: show which asset is selected -->
<div class="mt-2 text-sm text-gray-700">
  Selected asset: {selectedAsset ?? 'none'}
</div>


<!-- Debug: show state_trading (or state_position) record -->
<div class="mt-4 p-2 bg-gray-50 text-xs font-mono border rounded">
  <strong>state_trading snapshot:</strong>
  <pre>{JSON.stringify(priceSnapshot, null, 2)}</pre>
</div>

<div class="mt-3 text-xs font-mono bg-gray-50 border rounded p-2">
  state_position: state={statePosition.state} • updated={statePosition.updated}
</div>
