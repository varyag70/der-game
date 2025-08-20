import { goto } from '$app/navigation';
import { pb } from '$lib/pb';
import { createUserPosition } from '$lib/pb-createPosition';

//const uid = () => pb.authStore.record?.id ?? null;

export async function registerWithUsername(username: string, password: string) {
  pb.authStore.clear();

  // 1) create user
  const user = await pb.collection('users').create({
    username,
    password,
    passwordConfirm: password,
    name: username
  });

  // 2) login
  await pb.collection('users').authWithPassword(username, password);

  // 3) seed default TODO
  //const id = uid();
  //if (id) {
  //  try {
  //    await pb.collection('todos').create({
  //      user: id,
  //      text: 'sleep',        // if your field is `title` instead of `text`, change key to `title`
 //       done: false           // if your field is `completed`, change key to `completed`
 //     });
 //   } catch {
 //     /* ignore seed failure */
 //   }
 // }

  await createUserPosition(pb, 'RUB', 1_000_000
);

  return user;
}

export async function loginWithUsername(username: string, password: string) {
  return pb.collection('users').authWithPassword(username, password);
}

export function logout() {
  pb.authStore.clear();
  goto('/auth/login', { replaceState: true });
}
