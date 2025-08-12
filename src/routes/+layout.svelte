<script lang="ts">
  import "../app.css"; // Tailwind global
  import { session, pb } from "$lib/pb";
  import { goto } from "$app/navigation";
  const { children } = $props();
  const user = $derived($session ?? null);

  function logout() {
    pb.authStore.clear();
    goto("/");
  }
</script>

<!-- App shell -->
<div class="min-h-dvh bg-gray-50 text-gray-900">
  <!-- Top nav -->
  <header class="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
    <nav class="mx-auto max-w-4xl px-4 h-14 flex items-center gap-4">
      <a href="/" class="font-semibold tracking-tight hover:opacity-80">Todo</a>

      {#if user}
        <a href="/todos" class="text-gray-600 hover:text-gray-900">Todos</a>
        <button
          class="ml-auto inline-flex items-center rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50 active:scale-[.99] transition"
          onclick={logout}
        >
          Logout
        </button>
      {:else}
        <a class="ml-auto text-gray-600 hover:text-gray-900" href="/auth/login"
          >Login</a
        >
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

  <footer class="mt-16 py-8 text-center text-sm text-gray-500">
    Built with Svelte 5 + PocketBase + Tailwind
  </footer>
</div>
