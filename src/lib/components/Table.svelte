<script lang="ts">
	import { onMount } from 'svelte';
	import { pb } from '$lib/pb/pb';
	import { assets } from '$lib/types';

	import {
		currentPositionsStore,
		loadCurrentPositions,
		subscribeCurrentPositions,
		stopCurrentPositionsRealtime
	} from '$lib/positions-store';

	import {
		pricesStore,
		priceSourceStore,
		setupPrices,
		teardownPrices
	} from '$lib/prices-store';

	// Runes
	const currentPositions = $derived($currentPositionsStore); // Record<Asset, number>
	const prices = $derived($pricesStore);                     // Record<Asset, number|null>
	const priceSource = $derived($priceSourceStore);           // 'global' | 'user'

	onMount(() => {
		(async () => {
			// positions
			await loadCurrentPositions(pb);
			await subscribeCurrentPositions(pb);

			// prices (reads config/app and wires correct source)
			await setupPrices(pb);
		})();

		// sync cleanup
		return () => {
			stopCurrentPositionsRealtime(pb);
			teardownPrices(pb);
		};
	});

	function fmt(x: number | null | undefined) {
		if (x == null) return '—';
		return Number.isInteger(x) ? x.toString() : x.toFixed(2);
	}
</script>

<table class="w-full border-collapse text-sm">
	<thead>
		<tr class="border-b">
			<th class="px-3 py-2 text-left">Asset</th>
			<th class="px-3 py-2 text-right">Amount</th>
			<th class="px-3 py-2 text-right">Price</th>
		</tr>
	</thead>
	<tbody>
		{#each assets as a}
			<tr class="border-b last:border-0">
				<td class="px-3 py-2">{a}</td>
				<td class="px-3 py-2 text-right">{fmt(currentPositions[a] ?? 0)}</td>
				<td class="px-3 py-2 text-right">{fmt(prices[a])}</td>
			</tr>
		{/each}
	</tbody>
</table>
