import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Bump this to invalidate every cached response regardless of prompt/input.
 * The prompt text is also part of the cache key (see runCached), so editing a
 * prompt invalidates its cache automatically — this is for other changes (e.g.
 * model, reasoning effort) that the key would otherwise miss.
 */
const VERSION = "1";

const CACHE_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", ".cache");

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function keyFor(kind: string, input: string, promptText: string): string {
  return sha256(
    `${kind}:${VERSION}:${sha256(promptText)}:${sha256(input)}`,
  ).slice(0, 32);
}

export type CacheStats = { hits: number; misses: number };

/**
 * Run `fn` (which performs the real, token-spending LLM call) unless a cached
 * result exists for this (kind, input, prompt) triple. The full
 * prompt→parse→normalize pipeline runs on a miss; re-runs read from disk.
 *
 * @param refresh when true, always call `fn` and overwrite the cache entry.
 */
export async function runCached<T>(
  kind: string,
  input: string,
  promptText: string,
  fn: () => Promise<T>,
  opts: { refresh: boolean; stats?: CacheStats },
): Promise<{ value: T; cached: boolean }> {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
  const path = join(CACHE_DIR, `${kind}-${keyFor(kind, input, promptText)}.json`);

  if (!opts.refresh && existsSync(path)) {
    const value = JSON.parse(readFileSync(path, "utf8")) as T;
    if (opts.stats) opts.stats.hits++;
    return { value, cached: true };
  }

  const value = await fn();
  writeFileSync(path, JSON.stringify(value, null, 2));
  if (opts.stats) opts.stats.misses++;
  return { value, cached: false };
}

export { CACHE_DIR };
