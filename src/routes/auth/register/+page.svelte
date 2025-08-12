<script lang="ts">
	import { pb } from '$lib/pb';
	import { goto } from '$app/navigation';
	let email = '',
		username = '',
		password = '',
		error = '';
	async function submit() {
		error = '';
		try {
			await pb.collection('users').create({ email, username, password, passwordConfirm: password });
			await pb.collection('users').authWithPassword(username || email, password);
			goto('/todos');
		} catch (e) {
			error = 'Registration failed';
		}
	}
</script>

<form class="mx-auto flex max-w-sm flex-col gap-3 p-6" on:submit|preventDefault={submit}>
	<h1 class="text-xl font-bold">Register</h1>
	<input bind:value={email} type="email" placeholder="email" class="rounded border p-2" /><input
		bind:value={username}
		placeholder="username"
		class="rounded border p-2"
	/><input
		bind:value={password}
		type="password"
		placeholder="password"
		class="rounded border p-2"
	/>{#if error}<p class="text-sm text-red-600">{error}</p>{/if}<button class="rounded border p-2"
		>Create account</button
	>
</form>
