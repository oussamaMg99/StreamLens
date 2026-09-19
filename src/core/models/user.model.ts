import type { User as FirebaseUser } from 'firebase/auth';

// Mirrors the subset of Firebase Auth's user object the app actually needs. No token
// field on purpose: Firebase ID tokens expire hourly and the SDK refreshes them itself,
// so they're read on demand via getIdToken() rather than stored anywhere.
export interface User {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  /** e.g. 'password', 'google.com' — one per linked sign-in method. */
  providerIds: string[];
  createdAt?: string;
  lastSignInAt?: string;
}

/**
 * Plain snapshot of a Firebase user for app state. The Firebase object itself shouldn't
 * go into state: it's mutated in place (so React can't see profile edits) and its
 * toJSON() includes the refresh token.
 */
export const toUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email ?? undefined,
  displayName: firebaseUser.displayName ?? undefined,
  photoURL: firebaseUser.photoURL ?? undefined,
  phoneNumber: firebaseUser.phoneNumber ?? undefined,
  emailVerified: firebaseUser.emailVerified,
  providerIds: firebaseUser.providerData.map(provider => provider.providerId),
  createdAt: firebaseUser.metadata.creationTime,
  lastSignInAt: firebaseUser.metadata.lastSignInTime,
});
