<script lang="ts">
	import '../app.css'; // Tailwind global
	import { session, pb } from '$lib/pb';
	import { goto } from '$app/navigation';
	const { children } = $props();
	const user = $derived($session ?? null);

	function logout() {
		pb.authStore.clear();
		goto('/');
	}
</script>

<!-- App shell -->
<div class="min-h-dvh bg-gray-50 text-gray-900">
	<!-- Top nav -->
	<header class="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
		<nav class="mx-auto flex h-20 max-w-4xl items-center gap-4 px-4">
			<a href="/" class="font-semibold tracking-tight hover:opacity-80">Todo</a>

			{#if user}
				<a href="/todos" class="text-gray-600 hover:text-gray-900">Todos</a>

				<!-- Username above logout inside one wider button -->
				<div class="ml-auto pl-8">
					<button
						class="inline-flex w-28 flex-col items-center rounded-xl border px-6 py-2 hover:bg-gray-50 active:scale-[.99]"
						onclick={logout}
					>
						<span class="font-bold">{user.username}</span>
						<span class="text-base leading-tight font-semibold text-gray-900">Logout</span>
					</button>
				</div>
			{:else}
				<a class="ml-auto text-gray-600 hover:text-gray-900" href="/auth/login">Login</a>
				<a
					class="inline-flex items-center rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
					href="/auth/register">Register</a
				>
			{/if}
		</nav>
	</header>

	<!-- Page -->
	<main class="mx-auto max-w-4xl px-4 py-8">
		{@render children()}
	</main>
</div>
