import type { Metadata } from "next";
import Link from "next/link";
import { FileCheck2, Users, HeartHandshake, ArrowRight } from "lucide-react";
import { PledgeButton } from "@/components/elections/PledgeButton";

export const metadata: Metadata = {
  title: "Get Involved — Toronto 2026 Election",
  description:
    "Toronto votes Monday, October 26. Pledge to vote, register, volunteer, or donate — the Toronto you know is possible doesn't vote itself in.",
  alternates: { canonical: "/toronto/elections/get-involved" },
  openGraph: {
    title: "Get Involved — Toronto 2026 Election | Build Canada",
    description:
      "Pledge to vote in Toronto's 2026 municipal election on October 26, 2026 — and find out how to register, volunteer, and donate.",
    type: "website",
  },
};

const WAYS = [
  {
    n: "01",
    icon: FileCheck2,
    title: "Register to Vote",
    body: (
      <>
        Eligible isn&rsquo;t the same as registered. Take two minutes and make
        sure you&rsquo;re on the voters&rsquo; list before October.
      </>
    ),
    action: {
      label: "registertovoteon.ca",
      href: "https://registertovoteon.ca",
    },
  },
  {
    n: "02",
    icon: Users,
    title: "Volunteer",
    body: (
      <>
        There&rsquo;s no better way to build this city than volunteering in an
        election. Think of us as your political concierge — get in touch and
        we&rsquo;ll connect you to the campaign of your choice. The benefits are
        abundant and rewarding. You&rsquo;ll thank us for it later.
      </>
    ),
    action: {
      label: "Get in touch",
      href: "mailto:toronto@buildcanada.com?subject=I%20want%20to%20volunteer",
    },
  },
  {
    n: "03",
    icon: HeartHandshake,
    title: "Donate",
    body: (
      <>
        Campaigns run on volunteers — and on donations. If giving your time
        isn&rsquo;t in the cards, giving to a campaign is just as vital. Reach
        out and we&rsquo;ll point you to the campaign of your choice. Your city
        will thank you for it.
      </>
    ),
    action: {
      label: "Reach out",
      href: "mailto:toronto@buildcanada.com?subject=I%20want%20to%20donate",
    },
  },
];

export default function GetInvolvedPage() {
  return (
    <div className="theme-election bg-bg text-dark">
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="px-6 py-16 md:px-14 md:py-24 border-b-2 border-dark text-center flex flex-col items-center">
          <p className="type-label text-accent mb-6">
            Toronto votes Monday, October&nbsp;26
          </p>
          <h1 className="font-sans font-medium leading-[0.95] tracking-[-0.04em] text-[clamp(3rem,8vw,6.5rem)] max-w-[15ch] text-balance mb-8">
            Don&rsquo;t just live here. Build&nbsp;here.
          </h1>
          <p className="font-serif text-[clamp(1.2rem,1.8vw,1.5rem)] leading-[1.5] max-w-[54ch] text-dark/85 mb-10">
            The mayor, 25 councillors, and school trustees elected that day
            decide what this city builds for the next four years. Old thinking
            won&rsquo;t save us. You might.
          </p>
          <PledgeButton className="group/btn inline-flex items-center gap-3 type-button text-bg bg-accent px-7 py-4 transition-colors hover:bg-auburn-700 cursor-pointer">
            Pledge to vote
            <ArrowRight className="size-4 shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
          </PledgeButton>
        </section>

        {/* ── Ways to get involved (full-width card grid) ──────── */}
        <section className="border-b-2 border-dark">
          <div className="grid md:grid-cols-3 gap-px bg-border-light">
            {WAYS.map(({ n, icon: Icon, title, body, action }) => (
              <div
                key={title}
                className="bg-bg flex flex-col px-6 py-11 md:px-10 md:py-14"
              >
                <div className="flex items-center justify-between mb-6">
                  <Icon
                    className="size-8 text-accent shrink-0"
                    strokeWidth={1.75}
                  />
                  <span className="font-sans font-medium text-[1.5rem] tracking-[-0.03em] text-border-light">
                    {n}
                  </span>
                </div>
                <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.7rem,2.4vw,2.15rem)] mb-4">
                  {title}
                </h2>
                <p className="font-serif text-[1.1rem] leading-[1.55] text-dark/85 flex-1 mb-6">
                  {body}
                </p>
                <a
                  href={action.href}
                  target={action.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    action.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="group/btn self-start inline-flex items-center gap-1.5 type-label-sm text-accent hover:underline underline-offset-2"
                >
                  {action.label}
                  <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── Closing CTA (Toronto-blue band, full bleed) ──────── */}
        <section className="bg-[#003086] text-bg px-6 py-20 md:px-14 md:py-28 text-center flex flex-col items-center">
          <p className="mb-8 font-serif italic text-[1.1rem] leading-[1.5] text-bg/70">
            &ldquo;We shall not err for want of boldness.&rdquo;
            <br className="sm:hidden" /> — Sir Wilfrid Laurier
          </p>
          <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.035em] text-[clamp(2rem,5vw,3.75rem)] max-w-[22ch] text-balance text-linen-100 mb-10">
            Build the Toronto you know is possible.
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/toronto/elections/2026"
              className="group/btn inline-flex items-center gap-3 type-button text-bg border-2 border-bg px-7 py-[calc(1rem-2px)] transition-colors hover:bg-bg hover:text-accent"
            >
              Explore the candidates
              <ArrowRight className="size-4 shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
            <PledgeButton className="group/btn inline-flex items-center gap-3 type-button text-accent bg-bg px-7 py-4 transition-colors hover:bg-linen-100 cursor-pointer">
              Pledge to vote
              <ArrowRight className="size-4 shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
            </PledgeButton>
          </div>
        </section>
      </div>
    </div>
  );
}
