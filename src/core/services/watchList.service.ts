// src/core/services/watchList.service.ts
//
// Firestore-backed watch list. Unlike movie/tv.service.ts these aren't ApiService
// subclasses — ApiService wraps axios for REST, which doesn't apply to the Firestore
// SDK, so this is a plain module of functions instead.
//
// Layout: one document per user, watchLists/{uid}, holding the whole watch_list array
// (the WatchList model, stored as-is). The document is absent until the user's first
// entry, which reads as an empty list rather than an error.
//
// Consequence: every write rewrites the whole array, so writes must go through
// runTransaction — otherwise a second tab (or another device) editing at the same time
// silently overwrites the first one's changes. The 1MB document ceiling is thousands of
// entries away, so size isn't a concern.

import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase.config';
import { WatchList, WatchListEntry, WatchListResponse } from '../models/watchList.model';

const WATCH_LISTS_COLLECTION = 'watchLists';

const watchListRef = (uid: string) => doc(db, WATCH_LISTS_COLLECTION, uid);

/**
 * Stable key for a single entry, used client-side for React keys and lookups. A movie
 * and a TV show can share the same numeric TMDB id, so media_type has to be part of it.
 */
export const watchListEntryId = (entry: Pick<WatchListEntry, 'media_type' | 'id'>): string => `${entry.media_type}_${entry.id}`;

export async function getWatchList(uid: string): Promise<WatchListResponse> {
  const snapshot = await getDoc(watchListRef(uid));
  // No document yet just means the user hasn't tracked anything.
  return snapshot.exists() ? (snapshot.data() as WatchList) : { uid, watch_list: [] };
}
