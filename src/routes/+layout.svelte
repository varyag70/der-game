<script lang="ts">
	import '../app.css';
	import { session, pb } from '$lib/pb';
	import { goto } from '$app/navigation';
	import { logout } from '$lib/auth';
	const { children } = $props();
	const user = $derived($session ?? null);
</script>

<!-- App shell -->
<div class="min-h-dvh bg-gray-50 text-gray-900">
	<!-- Top nav -->
	<header class="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
		<nav class="mx-auto flex h-20 max-w-4xl items-center gap-4 px-4">
			<!--		<a href="/" class="font-semibold tracking-tight hover:opacity-80">Account</a> -->

			{#if user}
				<a href="/" class="text-gray-600 hover:text-gray-900">Account</a>

				<!-- Username above logout inside one wider button -->
				<div class="ml-auto pl-8">
					<button
						type="button"
						class="group inline-flex w-28 flex-col items-center rounded-xl border px-6 py-2 hover:bg-gray-50 active:scale-[.99]"
						onclick={logout}
					>
						<span class="font-bold">{user.username}</span>
						<span class="text-base text-gray-600 hover:text-gray-900"> Logout </span>
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
