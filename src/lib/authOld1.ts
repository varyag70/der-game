// src/lib/auth.ts
import { goto } from '$app/navigation';
import { pb } from '$lib/pb';

// Helper: get current user id (works across PB versions)
function uid() {
  return pb.authStore.model?.id ?? pb.authStore.record?.id ?? null;
}

// Helper: seed one default position if user has none
async function seedUserPositions(userId: string) {
  try {
    // fast check: if any record exists for this user, stop
    await pb.collection('user_positions').getFirstListItem(`user="${userId}"`);
    return; // already has positions
  } catch {
    // none exist -> create one
    await pb.collection('user_positions').create({
      user: userId,
      nameAsset: 'RUB',
      x: 1_000_000,
      price: 1,
      value: 1_000_000
    });
  }
}

export async function registerWithUsername(username: string, password: string) {
  // make sure registration runs as a guest (not as a logged-in normal user)
  pb.authStore.clear();

  // 1) create user (users Create rule must allow guests)
  const user = await pb.collection('users').create({
    username,
    password,
    passwordConfirm: password,
    name: username
  });

  // 2) login
  await pb.collection('users').authWithPassword(username, password);

  // 3) seed default positions (now authenticated)
  //const id = uid();
  //if (id) await seedUserPositions(id);

  return user;
}

export async function loginWithUsername(username: string, password: string) {
  // normal login
  const res = await pb.collection('users').authWithPassword(username, password);

  // optionally ensure seed on login too (harmless if already present)
  const id = uid();
  if (id) await seedUserPositions(id);

  return res;
}

export function logout() {
  pb.authStore.clear();
  goto('/auth/login', { replaceState: true });
}
