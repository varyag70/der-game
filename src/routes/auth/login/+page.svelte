<script lang="ts">
	import { loginWithUsername } from '$lib/auth';
	import { goto } from '$app/navigation';

	// Runes state (no imports needed)
	let username = $state('');
	let password = $state('');
	let error = $state('');
	let busy = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault(); // replaces |preventDefault and avoids on:submit
		if (busy) return;
		busy = true;
		error = '';
		try {
			await loginWithUsername(username, password);
			goto('/');
		} catch {
			error = 'Invalid username or password';
		} finally {
			busy = false;
		}
	}
</script>

<form onsubmit={submit} class="mx-auto flex max-w-sm flex-col gap-3 p-6">
	<h1 class="text-xl font-bold">Login</h1>

	<input
		bind:value={username}
		placeholder="Username"
		autocomplete="username"
		class="rounded border p-2"
		required
	/>

	<input
		bind:value={password}
		type="password"
		placeholder="Password"
		autocomplete="current-password"
		class="rounded border p-2"
		required
	/>

	<button
		type="submit"
		disabled={busy}
		class="rounded bg-blue-500 p-2 text-white disabled:opacity-50"
	>
		{busy ? 'Logging in…' : 'Login'}
	</button>

	{#if error}<p class="text-red-500">{error}</p>{/if}
</form>
