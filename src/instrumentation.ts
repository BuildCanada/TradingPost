/**
 * Server-process startup hook. Next.js calls `register()` once per server
 * process, which is where the Builder MP refresh sweep is scheduled.
 *
 * This is an in-process timer rather than a platform cron because the site runs
 * as a long-lived container. The sweep takes a Mongo lease before doing any
 * work, so running more than one replica is safe.
 *
 * Off unless BILLS_REFRESH_ENABLED=true, so a local `next dev` or a one-off
 * container never starts spending OpenAI calls by accident.
 *
 * Unrelated to `instrumentation-client.ts` at the repo root, which is PostHog's.
 */

const DEFAULT_INTERVAL_MINUTES = 60;
/** Let the server finish booting and start serving before the first sweep. */
const FIRST_RUN_DELAY_MS = 2 * 60 * 1000;

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.BILLS_REFRESH_ENABLED !== "true") return;

  const intervalMinutes =
    Number(process.env.BILLS_REFRESH_INTERVAL_MINUTES) ||
    DEFAULT_INTERVAL_MINUTES;

  const runSweep = async () => {
    try {
      // Imported lazily so the bills service graph is not pulled into every
      // server start, only into the ones that actually schedule the sweep.
      const { refreshBills } = await import("@/app/bills/services/refresh");
      await refreshBills();
    } catch (error) {
      // A throw here must never take the server down.
      console.error("[bills-refresh] sweep threw:", error);
    }
  };

  console.log(
    `[bills-refresh] scheduled every ${intervalMinutes}m (first run in ${FIRST_RUN_DELAY_MS / 60000}m)`,
  );

  setTimeout(() => {
    void runSweep();
    setInterval(() => void runSweep(), intervalMinutes * 60 * 1000).unref();
  }, FIRST_RUN_DELAY_MS).unref();
}
