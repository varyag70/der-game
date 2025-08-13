<script lang="ts">
	import { pb } from '$lib/pb';
	import { goto } from '$app/navigation';

	type Todo = { id: string; text: string; done: boolean; user: string };
	let items: Todo[] = $state([]);
	let text: string = $state('');

	$effect(() => {
		if (!pb.authStore.isValid) goto('/auth/login');
	});

	// initial fetch
	$effect(() => {
		if (!pb.authStore.isValid || !pb.authStore.record) return;
		const userId = pb.authStore.record.id;
		(async () => {
			const list = await pb
				.collection('todos')
				.getFullList<Todo>({ filter: `user="${userId}"`, sort: '-created' });
			items.splice(0, items.length, ...list);
		})();
	});

	// realtime
	$effect(() => {
		if (!pb.authStore.isValid) return;
		let stop: undefined | (() => void);
		pb.collection('todos')
			.subscribe('*', (e: any) => {
				if (e.action === 'create') items.unshift(e.record);
				else if (e.action === 'update') {
					const i = items.findIndex((t) => t.id === e.record.id);
					if (i !== -1) items[i] = e.record;
				} else if (e.action === 'delete') {
					const i = items.findIndex((t) => t.id === e.record.id);
					if (i !== -1) items.splice(i, 1);
				}
			})
			.then((unsub) => (stop = unsub));
		return () => {
			stop?.();
		};
	});

	async function add() {
		const v = text.trim();
		if (!v || !pb.authStore.record) return;
		await pb.collection('todos').create({ text: v, user: pb.authStore.record.id, done: false });
		text = '';
	}
	async function toggle(id: string, done: boolean) {
		await pb.collection('todos').update(id, { done });
	}
	async function remove(id: string) {
		await pb.collection('todos').delete(id);
	}
</script>

<section class="space-y-6">
	<h1 class="mb-4 text-3xl font-bold text-emerald-600">Your Todos</h1>

	<!--  <h1 class="text-3xl font-bold tracking-tight">Your Todos</h1> -->

	<form
		class="flex gap-2"
		onsubmit={(e) => {
			e.preventDefault();
			add();
		}}
	>
		<input
			class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 ring-0 outline-none focus:border-gray-400"
			bind:value={text}
			placeholder="What needs doing?"
		/>
		<button
			type="submit"
			class="rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-gray-50 active:scale-[.99] disabled:opacity-50"
			disabled={!text.trim()}
		>
			Add
		</button>
	</form>

	<div class="rounded-2xl border bg-white p-4">
		{#if items.length === 0}
			<p class="text-gray-500">No todos yet. Add one!</p>
		{:else}
			<ul class="divide-y">
				{#each items as t (t.id)}
					<li class="flex items-center gap-3 py-3">
						<input
							type="checkbox"
							class="h-4 w-4 rounded border-gray-300"
							checked={t.done}
							onchange={(e) => toggle(t.id, e.currentTarget.checked)}
						/>
						<span class={t.done ? 'text-gray-400 line-through' : 'text-gray-900'}>{t.text}</span>
						<button
							class="ml-auto rounded-lg border px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
							onclick={() => remove(t.id)}
						>
							Delete
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>
