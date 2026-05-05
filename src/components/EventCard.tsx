import Image from "next/image";
import { LumaEvent } from "@/lib/luma/types";

function formatEventDate(iso: string, tz: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string, tz: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function formatAddress(event: LumaEvent): string | null {
  const addr = event.address;
  if (!addr) return null;
  if (addr.description) return addr.description;
  const parts = [addr.city, addr.region].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  return null;
}

export default function EventCard({ event }: { event: LumaEvent }) {
  const eventDate = formatEventDate(event.startAt, event.timezone);
  const eventLocalTime = formatTime(event.startAt, event.timezone);
  const address = formatAddress(event);
  const hostNames = event.hosts
    .map((h) => h.name)
    .filter(Boolean) as string[];

  return (
    <div className="border-b border-r border-border-light overflow-hidden flex flex-col md:flex-row md:h-44">
      {event.coverUrl && (
        <div className="shrink-0 aspect-square overflow-hidden md:h-full md:aspect-square md:w-44">
          <Image
            src={event.coverUrl}
            alt=""
            width={640}
            height={640}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0 p-6 pt-4 md:p-6">
        <p className="type-label font-bold text-text-secondary m-0 pb-1">
          <span>{eventDate}</span>
          <span className="mx-1.5">·</span>
          <span>{eventLocalTime}</span>
        </p>
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="type-h4 text-text block mt-2 hover:underline"
        >
          {event.name}
        </a>
        {hostNames.length > 0 && (
          <p className="type-caption text-text-secondary mt-1">
            {hostNames.join(", ")}
          </p>
        )}
        {address && (
          <p className="type-caption text-text-secondary mt-0.5">
            {address}
          </p>
        )}
      </div>
    </div>
  );
}
