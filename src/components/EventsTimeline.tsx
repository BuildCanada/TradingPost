import EventCard from "@/components/EventCard";
import { LumaEvent } from "@/lib/luma/types";

export default async function EventsTimeline() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5050";
  let events: LumaEvent[] = [];

  try {
    const res = await fetch(`${baseUrl}/api/events?limit=3`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    events = data.events ?? [];
  } catch {}

  return (
    <div className="py-12 flex flex-col h-full">
      <span className="type-label text-dark block pb-4">Events</span>
      <div className="border-t border-l border-border-light flex-1 flex flex-col">
        {events.length === 0 ? (
          <div className="border-b border-r border-border-light p-6 text-center">
            <p className="type-caption text-text-secondary">
              No upcoming events
            </p>
            <a
              href="https://lu.ma/cal-KUFO2yscrfWr7RV"
              target="_blank"
              rel="noopener noreferrer"
              className="type-label text-accent hover:underline mt-2 inline-block"
            >
              View all events →
            </a>
          </div>
        ) : (
          <>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
            <div className="border-t border-b border-r border-border-light p-4 mt-auto">
              <a
                href="https://lu.ma/cal-KUFO2yscrfWr7RV"
                target="_blank"
                rel="noopener noreferrer"
                className="type-label text-accent hover:underline"
              >
                View all events →
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
