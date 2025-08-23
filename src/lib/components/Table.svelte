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

	// Runes
	const currentPositions = $derived($currentPositionsStore);

	// onMount must return a *sync* cleanup fn
	onMount(() => {
		(async () => {
			await loadCurrentPositions(pb);
			await subscribeCurrentPositions(pb);
		})();

		return () => {
			// cleanup (sync)
			stopCurrentPositionsRealtime(pb);
		};
	});

	// tiny formatter: ints without decimals, others up to 2
	function fmt(x: number) {
		return Number.isInteger(x) ? x.toString() : x.toFixed(2);
	}
</script>

<!-- Simple table (Tailwind optional) -->
<table class="w-full border-collapse text-sm">
	<thead>
		<tr class="border-b">
			<th class="px-3 py-2 text-left">Asset</th>
			<th class="px-3 py-2 text-right">Amount</th>
		</tr>
	</thead>
	<tbody>
		{#each assets as a}
			<tr class="border-b last:border-0">
				<td class="px-3 py-2">{a}</td>
				<td class="px-3 py-2 text-right">{fmt(currentPositions[a] ?? 0)}</td>
			</tr>
		{/each}
	</tbody>
</table>
