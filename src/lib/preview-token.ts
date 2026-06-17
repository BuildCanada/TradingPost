import { cache } from "react";

type Store = { value: string | undefined };

const _store = cache((): Store => ({ value: undefined }));

export function setPreviewToken(token: string | undefined): void {
  _store().value = token;
}

export function getPreviewToken(): string | undefined {
  return _store().value;
}
