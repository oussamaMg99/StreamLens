// src/core/services/watchList.service.ts
//
// Firestore-backed watch list. Unlike movie/tv.service.ts these aren't ApiService
// subclasses — ApiService wraps axios for REST, which doesn't apply to the Firestore
// SDK, so this is a plain module of functions instead.
//
// Layout: watchLists/{uid}/entries/{entryId} — one document per tracked title rather
// than a single array document, so marking one episode watched rewrites one small doc
// instead of read-modify-writing the whole list (which would also risk losing
// concurrent updates from another tab or device).

import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase.config';
import { WatchListEntry, WatchListResponse } from '../models/watchList.model';

const WATCH_LISTS_COLLECTION = 'watchLists';
const ENTRIES_SUBCOLLECTION = 'entries';

/**
 * Document id for a single entry. A movie and a TV show can share the same numeric
 * TMDB id, so media_type has to be part of the key to keep them distinct.
 */
export const watchListEntryId = (entry: Pick<WatchListEntry, 'media_type' | 'id'>): string =>
  `${entry.media_type}_${entry.id}`;

export async function getWatchList(uid: string): Promise<WatchListResponse> {
  const snapshot = await getDocs(collection(db, WATCH_LISTS_COLLECTION, uid, ENTRIES_SUBCOLLECTION));
  return snapshot.docs.map(entry => entry.data() as WatchListEntry);
}
