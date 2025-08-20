import { pb } from '$lib/pb';
import { goto } from '$app/navigation';

/**
 * Registers a new user using only username and password.
 * Generates a fake unique email so PocketBase is happy.
 */


export async function registerWithUsername(username: string, password: string) {
  // 1) create user
  const user = await pb.collection('users').create({
    username,
    password,
    passwordConfirm: password,
    name: username
  });

  // 2) login
  await pb.collection('users').authWithPassword(username, password);

  // 3) seed default positions
 // const userId = pb.authStore.record?.id; // modern API
 // if (userId) {
 //   const existing = await pb.collection('user_positions').getList(1, 1, {
 //     filter: `user="${userId}"`
 //   });

  //  if (existing.totalItems === 0) {
  //    await pb.collection('user_positions').create({
  //      nameAsset: 'RUB',
  //      x: 1_000_000,
  //      price: 1,
  //      value: 1_000_000,
  //      user: userId
  //    });
  //  }
//  }

  return user;
}


export async function loginWithUsername(username: string, password: string) {
  return pb.collection('users').authWithPassword(username, password);
}

/**
 * Logs out the current user
 */
export function logout() {
  pb.authStore.clear();
  // go straight to login so navigation definitely occurs
  goto('/auth/login', { replaceState: true });
}
