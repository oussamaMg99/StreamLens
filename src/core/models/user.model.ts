// Mirrors the subset of Firebase Auth's user object the app actually needs. No token
// field on purpose: Firebase ID tokens expire hourly and the SDK refreshes them itself,
// so they're read on demand via getIdToken() rather than stored anywhere.
export interface User {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
}
