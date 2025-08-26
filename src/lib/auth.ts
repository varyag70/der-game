import { pb } from '$lib/pb/pb';
import { createUserPosition } from '$lib/pb/pb-createPosition';
import { assets, isPBError } from '$lib/types';
import { goto } from '$app/navigation';

export async function registerUser(username: string, password: string) {
  pb.authStore.clear();

  try {
    // Try to create
    const user = await pb.collection('users').create({
      username,
      password,
      passwordConfirm: password,
      name: username
    });

    // Login after create
    await pb.collection('users').authWithPassword(username, password);

    // await createUserPosition(pb, 'RUB', 1_000_000);
    // await createUserPosition(pb, 'USD', 0);

    for (const a of assets) {
      const amount = a === 'RUB' ? 1_000_000 : 0;
      await createUserPosition(pb, a, amount);
    }

    return user;
  } catch (err: unknown) {
    if (isPBError(err)) {
      const code = err.data?.data?.username?.code;
      if (code === 'validation_not_unique') {
        await pb.collection('users').authWithPassword(username, password);
        return pb.authStore.record;
      }
      throw new Error(err.data?.message ?? err.message ?? 'Registration failed');
    }

    throw new Error('Unknown error during registration');
  }
}


export async function loginUser(username: string, password: string) {
  return pb.collection('users').authWithPassword(username, password);
}

export function logout() {
  pb.authStore.clear();
  goto('/auth', { replaceState: true });
}
