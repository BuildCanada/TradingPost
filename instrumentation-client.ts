import posthog from "posthog-js";

const IGNORED_EXTENSION_ERROR =
  "Invalid call to runtime.sendMessage(). Tab not found.";

const EXTENSION_FRAME_PREFIXES = [
  "chrome-extension://",
  "moz-extension://",
  "safari-extension:",
  "safari-web-extension:",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isKnownExtensionError(exception: unknown): boolean {
  if (!isRecord(exception) || exception.value !== IGNORED_EXTENSION_ERROR) {
    return false;
  }

  const stacktrace = exception.stacktrace;
  if (!isRecord(stacktrace) || !Array.isArray(stacktrace.frames)) {
    return false;
  }

  return stacktrace.frames.some((frame) => {
    if (!isRecord(frame) || typeof frame.filename !== "string") {
      return false;
    }

    const filename = frame.filename;
    return EXTENSION_FRAME_PREFIXES.some((prefix) =>
      filename.startsWith(prefix),
    );
  });
}

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_TOKEN) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_TOKEN, {
    api_host: "/ph",
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    defaults: "2026-01-30",
    capture_exceptions: true,
    before_send: (event) => {
      if (event?.event !== "$exception") {
        return event;
      }

      const exceptionList = event.properties.$exception_list;
      const rootException = Array.isArray(exceptionList)
        ? exceptionList[0]
        : undefined;

      // Do not filter on the message alone: require extension provenance from
      // the root exception's own stack. Stackless or app-originated lookalikes
      // are deliberately retained to avoid hiding a real application error.
      if (isKnownExtensionError(rootException)) {
        return null;
      }

      return event;
    },
  });
}
