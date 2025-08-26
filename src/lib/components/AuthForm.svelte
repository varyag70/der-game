<script lang="ts">
  import { goto } from '$app/navigation';
  import { loginUser, registerUser } from '$lib/auth';
  // ^ If your login function has a different name, adjust the import.

  // Runes state
  let mode = $state<'login' | 'register'>('login');
  let username = $state('');
  let password = $state('');
  let password2 = $state(''); // only used in register
  let busy = $state(false);
  let error = $state('');

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    if (busy) return;
    busy = true;
    error = '';

    try {
      if (mode === 'login') {
        await loginUser(username, password);
      } else {
        if (password !== password2) throw new Error('Passwords do not match');
        await registerUser(username, password); // should also log in
      }
      goto('/'); // success redirect
    } catch (err) {
      error = (err as Error).message ?? 'Authentication failed';
    } finally {
      busy = false;
    }
  }

  function switchMode(next: 'login' | 'register') {
    mode = next;
    error = '';
    password = '';
    password2 = '';
  }
</script>

<form onsubmit={submit} class="mx-auto flex max-w-sm flex-col gap-3 p-6">
  <div class="flex justify-center gap-2">
    <button
      type="button"
      class="rounded border px-3 py-1 aria-pressed:bg-black aria-pressed:text-white"
      aria-pressed={mode === 'login'}
      onclick={() => switchMode('login')}
    >
      Login
    </button>
    <button
      type="button"
      class="rounded border px-3 py-1 aria-pressed:bg-black aria-pressed:text-white"
      aria-pressed={mode === 'register'}
      onclick={() => switchMode('register')}
    >
      Register
    </button>
  </div>

  <h1 class="text-xl font-bold text-center">
    {mode === 'login' ? 'Log in' : 'Create account'}
  </h1>

  <input
    bind:value={username}
    placeholder="Username"
    class="rounded border p-2"
    autocomplete="username"
    required
  />

  <input
    bind:value={password}
    type="password"
    placeholder="Password"
    class="rounded border p-2"
    autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
    required
  />

  {#if mode === 'register'}
    <input
      bind:value={password2}
      type="password"
      placeholder="Confirm password"
      class="rounded border p-2"
      autocomplete="new-password"
      required
    />
  {/if}

  {#if error}
    <p class="text-red-500 text-sm" aria-live="polite">{error}</p>
  {/if}

  <button
    type="submit"
    disabled={busy}
    class="rounded bg-blue-500 p-2 text-white disabled:opacity-50"
  >
    {busy
      ? (mode === 'login' ? 'Signing in…' : 'Creating…')
      : (mode === 'login' ? 'Log in' : 'Sign up')}
  </button>
</form>
