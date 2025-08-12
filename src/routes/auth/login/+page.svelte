<script lang="ts">
  import { pb } from "$lib/pb";
  import { goto } from "$app/navigation";

  // local state (runes-friendly)
  let id = $state("");
  let password = $state("");
  let error = $state("");
  let pending = $state(false);

  async function submit() {
    error = "";
    pending = true;
    try {
      await pb.collection("users").authWithPassword(id, password);
      goto("/todos");
    } catch (e: any) {
      error = e?.message ?? "Invalid credentials";
    } finally {
      pending = false;
    }
  }
</script>

<form
  class="mx-auto max-w-sm p-6 flex flex-col gap-3"
  onsubmit={(e) => {
    e.preventDefault();
    submit();
  }}
>
  <h1 class="text-xl font-bold">Login</h1>

  <input
    class="border rounded p-2"
    bind:value={id}
    placeholder="email or username"
    autocomplete="username"
  />

  <input
    class="border rounded p-2"
    type="password"
    bind:value={password}
    placeholder="password"
    autocomplete="current-password"
  />

  {#if error}
    <p class="text-red-600 text-sm">{error}</p>
  {/if}

  <button
    type="submit"
    class="border rounded p-2 disabled:opacity-50"
    disabled={!id.trim() || !password.trim() || pending}
  >
    {pending ? "Signing in…" : "Sign in"}
  </button>
</form>
