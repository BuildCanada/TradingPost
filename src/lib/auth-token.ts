import { cache } from "react";

type Store = { value: string | undefined };

// Request-scoped holder for the caller's OAuth access token. A server component
// sets it (when the signed-in user may access non-public data) and apiFetch
// reads it to attach the Authorization header. React.cache keeps it isolated
// per request.
const _store = cache((): Store => ({ value: undefined }));

export function setAccessToken(token: string | undefined): void {
  _store().value = token;
}

export function getAccessToken(): string | undefined {
  return _store().value;
}
