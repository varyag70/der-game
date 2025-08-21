import PocketBase from 'pocketbase';
import { readable } from 'svelte/store';
//export const PB_URL = import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090';

export const PB_URL = import.meta.env.VITE_PB_URL || 'https://derivative-game.com/pb';

//export const PB_URL = import.meta.env.VITE_PB_URL || 'https://derivative-game.com';

export const pb = new PocketBase(PB_URL);
export const session = readable(pb.authStore.record, (set) => { set(pb.authStore.record); const unsub = pb.authStore.onChange(() => set(pb.authStore.record)); return () => unsub?.(); });

// src/lib/pb.ts





