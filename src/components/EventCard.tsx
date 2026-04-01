"use client";

import Image from "next/image";
import SectionLabel from "@/components/SectionLabel";
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

function getUserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "America/New_York";
  }
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
  const userTz = getUserTimeZone();
  const eventDate = formatEventDate(event.startAt, event.timezone);
  const userTime = formatTime(event.startAt, userTz);
  const eventLocalTime = formatTime(event.startAt, event.timezone);
  const showUserTime = userTz !== event.timezone;
  const address = formatAddress(event);
  const hostNames = event.hosts
    .map((h) => h.name)
    .filter(Boolean) as string[];

  return (
    <div className="border border-border-light p-4 flex gap-4">
      <div className="flex-1 min-w-0">
        <SectionLabel>{eventDate}</SectionLabel>
        <p className="type-caption mt-1">
          {showUserTime ? (
            <>
              <span className="text-text-secondary">{userTime}</span>
              <span className="text-text-secondary mx-1">·</span>
            </>
          ) : null}
          <span className="text-auburn-800">{eventLocalTime}</span>
        </p>
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="type-h4 text-text block mt-1 hover:underline"
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
      <div className="w-20 h-20 flex-shrink-0 overflow-hidden">
        <Image
          src={event.coverUrl}
          alt=""
          width={80}
          height={80}
          className="w-full h-full object-cover object-left-center"
        />
      </div>
    </div>
  );
}
