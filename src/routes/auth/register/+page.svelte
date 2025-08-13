<script lang="ts">
	import { registerWithUsername } from '$lib/auth';
	import { goto } from '$app/navigation';

	let username = $state('');
	let password = $state('');
	let error = $state('');
	let busy = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (busy) return;
		busy = true;
		error = '';

		try {
			await registerWithUsername(username, password); // This now logs in the user
			goto('/'); // Redirect to the todo list or dashboard
		} catch (err) {
			error = (err as Error).message ?? 'Registration failed';
		} finally {
			busy = false;
		}
	}
</script>

<form onsubmit={submit} class="mx-auto flex max-w-sm flex-col gap-3 p-6">
	<h1 class="text-xl font-bold">Register</h1>

	<input bind:value={username} placeholder="Username" class="rounded border p-2" required />
	<input
		bind:value={password}
		type="password"
		placeholder="Password"
		class="rounded border p-2"
		required
	/>

	<button
		type="submit"
		disabled={busy}
		class="rounded bg-blue-500 p-2 text-white disabled:opacity-50"
	>
		{busy ? 'Creating…' : 'Sign Up'}
	</button>

	{#if error}<p class="text-red-500">{error}</p>{/if}
</form>
