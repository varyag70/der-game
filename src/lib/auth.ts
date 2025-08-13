import { pb } from '$lib/pb';

/**
 * Registers a new user using only username and password.
 * Generates a fake unique email so PocketBase is happy.
 */
export async function registerWithUsername(username: string, password: string) {
  // Create user
  const user = await pb.collection('users').create({
    username,
    password,
    passwordConfirm: password,
    name: username
  });

  // Login right after creating the user
  await pb.collection('users').authWithPassword(username, password);

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
}
