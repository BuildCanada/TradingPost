import { Button } from "@/components/ui/button";
import EventCard from "@/components/EventCard";
import { SectionHeader } from "@/components/ui/section-header";
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
    <div className="flex flex-col">
      <SectionHeader
        label="Events"
        action={<Button as="external-link" variant="charcoal" href="https://luma.com/build_canada">View all events</Button>}
      />
      <div className="border-t border-l border-border-light">
        {events.length === 0 ? (
          <div className="p-6 text-center">
            <p className="type-caption text-text-secondary">
              No upcoming events
            </p>
            <Button as="external-link" variant="ghost" href="https://luma.com/build_canada" className="mt-2">
              View all events
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-0">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
