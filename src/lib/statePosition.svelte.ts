// statePosition.svelte.ts
import type PocketBase from 'pocketbase';
import type { RecordSubscription } from 'pocketbase';
import { loadPositions } from '$lib/positions.svelte';


const COLL = 'state_position';

export type StatePosRec = {
  id: string;
  state: number | null;
  updated: string | null;
};

export const statePosition = $state<StatePosRec>({ id: '', state: null, updated: null });

let subscribedId: string | null = null;

export async function subscribeStatePosition(pb: PocketBase) {
  const uid = pb.authStore.record?.id;
  if (!uid) return;

  const rec = await pb.collection(COLL).getFirstListItem<StatePosRec>(`user="${uid}"`);
  statePosition.id = rec.id;
  statePosition.state = rec.state ?? null;
  statePosition.updated = rec.updated ?? null;

  // clear previous sub (only this record)
  if (subscribedId) await pb.collection(COLL).unsubscribe(subscribedId);
  subscribedId = rec.id;

  await pb.collection(COLL).subscribe<StatePosRec>(
    rec.id,
    async (e: RecordSubscription<StatePosRec>) => {
      const r = e.record;
      statePosition.state = r?.state ?? null;
      statePosition.updated = r?.updated ?? null;
      await loadPositions(pb); // reload once per change
    }
  );
}

export async function teardownStatePosition(pb: PocketBase) {
  if (subscribedId) {
    await pb.collection(COLL).unsubscribe(subscribedId);
    subscribedId = null;
  }
}
