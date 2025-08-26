<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { session } from '$lib/pb/pb';
	import { logout } from '$lib/auth';

	const { children } = $props();

	// For rendering in the template if you need it
	const user = $derived($session ?? null);

	// Redirect guests away from protected pages
	$effect(() => {
		const onAuth = $page.url.pathname.startsWith('/auth');
		if (!$session && !onAuth) goto('/auth');
	});

	// Optional: if an authed user opens /auth, send them home
	$effect(() => {
		if ($session && $page.url.pathname.startsWith('/auth')) goto('/');
	});
</script>


<div class="min-h-dvh bg-gray-50 text-gray-900">
  <header class="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
    <nav class="mx-auto flex h-20 max-w-4xl items-center gap-4 px-4">
      <a href="/" class="font-semibold tracking-tight hover:opacity-80">
        Derivative Game
      </a>

      {#if user}
        <a href="/" class="text-gray-600 hover:text-gray-900">Account</a>

        <!-- Username above Logout (single wide button) -->
        <div class="ml-auto pl-8">
          <button
            type="button"
            class="group inline-flex w-28 flex-col items-center rounded-xl border px-6 py-2 hover:bg-gray-50 active:scale-[.99]"
            onclick={logout}
          >
            <span class="font-bold truncate">{user.username}</span>
            <span class="text-base text-gray-600 group-hover:text-gray-900">Logout</span>
          </button>
        </div>
      {:else}
        <!-- Single entry for combined auth page -->
        <a
          href="/auth"
          class="ml-auto inline-flex items-center rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Sign in
        </a>
      {/if}
    </nav>
  </header>

  <main class="mx-auto max-w-4xl px-4 py-8">
    {@render children()}
  </main>
</div>
