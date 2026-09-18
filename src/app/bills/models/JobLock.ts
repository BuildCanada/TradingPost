import { Schema, model, models } from "mongoose";

export interface JobLockDocument {
  _id: string;
  expiresAt: Date;
  holder?: string;
}

/**
 * A lease, so that only one process runs a given job at a time.
 *
 * The refresh sweep spends OpenAI calls. One container runs the site today, but
 * a second replica would otherwise mean a second sweep analyzing the same bills
 * at the same time — this makes scaling out safe rather than expensive.
 */
const JobLockSchema = new Schema<JobLockDocument>({
  _id: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  holder: { type: String },
});

export const JobLock =
  models.JobLock || model<JobLockDocument>("JobLock", JobLockSchema);

/**
 * Take the lease if it is free or expired. Returns false when another process
 * holds it. The TTL bounds how long a crashed holder can block the job.
 */
export async function acquireLock(
  name: string,
  ttlMs: number,
  holder: string,
): Promise<boolean> {
  const now = new Date();
  try {
    await JobLock.findOneAndUpdate(
      { _id: name, expiresAt: { $lt: now } },
      { $set: { expiresAt: new Date(now.getTime() + ttlMs), holder } },
      { upsert: true },
    );
    return true;
  } catch (error) {
    // A duplicate-key error is the expected outcome when the lease is held: the
    // filter misses, the upsert tries to insert, and the _id already exists.
    if ((error as { code?: number })?.code === 11000) return false;
    console.error(`[bills] Failed to acquire lock "${name}":`, error);
    return false;
  }
}

export async function releaseLock(name: string, holder: string): Promise<void> {
  try {
    await JobLock.updateOne(
      { _id: name, holder },
      { $set: { expiresAt: new Date(0) } },
    );
  } catch (error) {
    // The TTL expiry is the backstop, so a failed release is not fatal.
    console.error(`[bills] Failed to release lock "${name}":`, error);
  }
}
