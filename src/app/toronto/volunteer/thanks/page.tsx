import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { getSiteConfig } from "@/lib/api";
import { ELECTION, ELECTION_DAY, HOW_TO_VOTE_PATH } from "../../vote/2026/key-dates";
import { TRAINING_DATES, VOLUNTEER_PATH } from "../build-the-vote";
import { GUTTER } from "../gutter";
import { InviteFriends } from "./InviteFriends";

export const metadata: Metadata = {
  title: "You’re in",
  robots: { index: false, follow: false },
};

const EVENT_TITLE = "Volunteer on Election Day (Build the Vote)";
const EVENT_DETAILS =
  "Your volunteer coordinator will confirm where and when. Polls are open 10 a.m. to 8 p.m.";

/* An all-day event: the shift's time and place come from the coordinator's
   call, so the calendar holds the day rather than guessing at hours. */
const eventStart = ELECTION.electionDateIso.replaceAll("-", "");
const eventEnd = String(Number(eventStart) + 1);

const GOOGLE_CALENDAR_URL =
  "https://calendar.google.com/calendar/render?" +
  new URLSearchParams({
    action: "TEMPLATE",
    text: EVENT_TITLE,
    dates: `${eventStart}/${eventEnd}`,
    details: EVENT_DETAILS,
  }).toString();

const ICS_URL =
  "data:text/calendar;charset=utf-8," +
  encodeURIComponent(
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Build Canada//Build the Vote//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:build-the-vote-${eventStart}@buildcanada.com`,
      "DTSTAMP:20261015T000000Z",
      `DTSTART;VALUE=DATE:${eventStart}`,
      `DTEND;VALUE=DATE:${eventEnd}`,
      `SUMMARY:${EVENT_TITLE}`,
      `DESCRIPTION:${EVENT_DETAILS.replace(/,/g, "\\,")}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n"),
  );

export default function VolunteerThanksPage() {
  const { siteUrl } = getSiteConfig();
  // Tagged so sign-ups from friends' invitations show up as their own source.
  const inviteUrl = `${siteUrl}${VOLUNTEER_PATH}?utm_source=volunteer_invite&utm_medium=referral&utm_campaign=build_the_vote`;
  const inviteMessage = `I'm volunteering in Toronto on Election Day, October 26, with Build Canada's Build the Vote. Two hours can help a candidate who shares our values win a close race. Join me: ${inviteUrl}`;

  const steps: { title: string; body: React.ReactNode }[] = [
    {
      title: "Save the date",
      body: (
        <>
          <p className="font-serif text-[1.05rem] leading-[1.5] text-text-secondary">
            {ELECTION.voteDayLabel}. Your coordinator will confirm where and
            when.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button as="external-link" variant="auburn" href={GOOGLE_CALENDAR_URL}>
              Add to Google Calendar
            </Button>
            <a
              href={ICS_URL}
              download="election-day-volunteer.ics"
              className="type-label inline-flex items-center px-5 py-3 border border-border-light hover:border-dark transition-colors"
            >
              Apple / Outlook
            </a>
          </div>
        </>
      ),
    },
    {
      title: "Watch for your training link",
      body: (
        <p className="font-serif text-[1.05rem] leading-[1.5] text-text-secondary">
          Short Zoom sessions run {TRAINING_DATES}. The link is in your
          confirmation email.
        </p>
      ),
    },
    {
      title: "Who will you bring?",
      body: (
        <>
          <p className="font-serif text-[1.05rem] leading-[1.5] text-text-secondary mb-4">
            Election Day is better with people you know. Ask two or three
            friends, family members or colleagues to join you.
          </p>
          <InviteFriends message={inviteMessage} />
        </>
      ),
    },
    {
      title: "Make your own plan to vote",
      body: (
        <>
          <p className="font-serif text-[1.05rem] leading-[1.5] text-text-secondary">
            Polls are open {ELECTION_DAY.hoursLabel} on October&nbsp;26. Fit
            your vote around your shift.
          </p>
          <div className="mt-4">
            <Button as="link" variant="ghost" href={HOW_TO_VOTE_PATH}>
              How to vote in Toronto
            </Button>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className={`${ELECTION.themeClass ?? ""} bg-bg text-dark`}>
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
        <section className={`${GUTTER} py-14 md:py-20 border-b-2 border-dark`}>
          <p className="type-label text-accent mb-5">Build the Vote</p>
          <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(2.6rem,6vw,5rem)] max-w-[16ch] text-balance mb-7">
            You&rsquo;re in. Thank you.
          </h1>
          <p className="font-serif text-[clamp(1.15rem,1.6vw,1.4rem)] leading-[1.5] max-w-[52ch]">
            A volunteer coordinator will call you in the next few days to
            match you with a candidate and a campaign. They may call from a
            number you don&rsquo;t recognize.
          </p>
        </section>

        <ol>
          {steps.map((step, i) => (
            <li
              key={step.title}
              className={`grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-14 gap-y-3 py-10 border-b border-border-light last:border-b-0 ${GUTTER}`}
            >
              <div>
                <p className="font-sans font-medium text-[1.5rem] tracking-[-0.03em] text-accent mb-2">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="font-sans font-medium text-[1.4rem] leading-[1.2] tracking-[-0.02em]">
                  {step.title}
                </h2>
              </div>
              <div className="min-w-0">{step.body}</div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
