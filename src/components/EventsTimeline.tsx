"use client";

import { useEffect, useState } from "react";
import SectionLabel from "@/components/SectionLabel";
import EventCard from "@/components/EventCard";
import { LumaEvent } from "@/lib/luma/types";

export default function EventsTimeline() {
  const [events, setEvents] = useState<LumaEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events?limit=3")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events ?? []);
        setLoading(false);
      })
      .catch(() => {
        setEvents([]);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <SectionLabel>Events</SectionLabel>
      <div className="mt-2 h-[450px] overflow-y-auto">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="border border-border-light p-4 flex gap-4 animate-pulse"
              >
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 bg-charcoal-200" />
                  <div className="h-3 w-32 bg-charcoal-200" />
                  <div className="h-4 w-48 bg-charcoal-200" />
                  <div className="h-3 w-24 bg-charcoal-200" />
                </div>
                <div className="w-20 h-20 bg-charcoal-200 flex-shrink-0" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="border border-border-light p-6 text-center">
            <p className="type-caption text-text-secondary">
              No upcoming events
            </p>
            <a
              href="https://lu.ma/cal-KUFO2yscrfWr7RV"
              target="_blank"
              rel="noopener noreferrer"
              className="type-label text-auburn-800 hover:underline mt-2 inline-block"
            >
              View all events →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
            <a
              href="https://lu.ma/cal-KUFO2yscrfWr7RV"
              target="_blank"
              rel="noopener noreferrer"
              className="type-label text-auburn-800 hover:underline block pt-2"
            >
              View all events →
            </a>
          </div>
        )}
      </div>
    </>
  );
}
