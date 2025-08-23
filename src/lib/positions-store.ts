import { writable } from 'svelte/store';
import type PocketBase from 'pocketbase';
import { assets, type Asset, type Positions } from '$lib/types';

const COLLECTION = 'user_positions';

const EMPTY: Positions = Object.fromEntries(assets.map(a => [a, 0])) as Positions;

// store that all components can use
export const currentPositionsStore = writable<Positions>({ ...EMPTY });

function requireUserId(pb: PocketBase) {
    const id = pb.authStore.record?.id;
    if (!id) throw new Error('Not authenticated');
    return id;
}

// load from PB once
export async function loadCurrentPositions(pb: PocketBase) {
    const uid = requireUserId(pb);

    const rows = await pb.collection(COLLECTION).getFullList({
        filter: `user="${uid}"`
    });

    const map: Positions = { ...EMPTY };
    for (const r of rows) {
        const a = r.assetName as Asset;
        if (assets.includes(a)) map[a] = Number(r.x) || 0;
    }
    currentPositionsStore.set(map);
}

// subscribe for realtime changes
export async function subscribeCurrentPositions(pb: PocketBase) {
    const uid = requireUserId(pb);
    await pb.collection(COLLECTION).unsubscribe(); // reset

    await pb.collection(COLLECTION).subscribe(
        '*',
        (e) => {
            const rec = e.record;
            if (!rec || rec.user !== uid) return;

            const a = rec.assetName as Asset;
            if (!assets.includes(a)) return;

            currentPositionsStore.update(p => ({ ...p, [a]: Number(rec.x) || 0 }));
        },
        { filter: `user="${uid}"` }
    );
}

export async function stopCurrentPositionsRealtime(pb: PocketBase) {
    await pb.collection(COLLECTION).unsubscribe();
}
