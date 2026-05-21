import type { Metadata } from "next";
import { PersonCard } from "@/components/ui/person-card";
import SectionLabel from "@/components/SectionLabel";
import QuickLinks from "@/app/about/QuickLinks";
import QnaBlock from "@/app/about/QnaBlock";

export const metadata: Metadata = {
  title: "About",
  description:
    "Build Toronto is a civic movement for a city that leads again — in ambition, in size, and in what a great city can be.",
  alternates: { canonical: "/toronto/about" },
  openGraph: {
    title: "🏗️ Toronto — About",
    description:
      "Build Toronto is a civic movement for a city that leads again.",
    type: "website",
  },
};

const quickLinks = [
  { label: "Principles", href: "#principles" },
  { label: "Leadership", href: "#leadership" },
  { label: "FAQs", href: "#faqs" },
];

const principles: { title: string; body: string }[] = [
  {
    title: "Toronto is Canada's launchpad.",
    body: "Toronto should be where the country pilots its boldest ideas — the place national ambition takes shape first.",
  },
  {
    title: "Growth drives opportunity.",
    body: "Cities don't succeed by saying no. Growth brings energy, investment, and the scale needed to support jobs, housing, and infrastructure.",
  },
  {
    title: "Toronto's future is urban.",
    body: "We are a city — not a suburb — and we should plan, build, and govern like it. Density and walkability are features, not threats.",
  },
  {
    title: "Talent belongs here.",
    body: "Toronto should keep its best — and attract the world's best — by being a place where ambitious people can live, work, and raise families.",
  },
  {
    title: "Cities are for people.",
    body: "Toronto is the daily interface for millions of lives. It should feel like it was designed with them in mind: functional, beautiful, and human.",
  },
  {
    title: "Courage over caution.",
    body: "Toronto has been governed too cautiously for too long — risk-averse, slow-moving, and captured by the status quo. We need decisive leadership.",
  },
  {
    title: "Make every dollar count.",
    body: "We need to tax more efficiently and spend more effectively, focusing on outcomes that actually improve daily life.",
  },
];

const faqs = [
  {
    id: "what-is-build-toronto",
    question: "What is Build Toronto?",
    answer:
      "<p>Build Toronto is the first city project of Build Canada. It is a civic initiative focused on generating bold ideas that support Toronto's growth and prosperity.</p>",
    order: 1,
    active: true,
  },
  {
    id: "who-is-involved",
    question: "Who is involved?",
    answer:
      "<p>Eric Lombardi chairs the initiative. The project draws on Build Canada's broader team and network, including Daniel Debow (Chair of Board) and Lucy Hargreaves (CEO).</p>",
    order: 2,
    active: true,
  },
  {
    id: "how-funded",
    question: "How is Build Toronto funded?",
    answer:
      "<p>Build Toronto is supported through Build Canada's network of donors and volunteers.</p>",
    order: 3,
    active: true,
  },
  {
    id: "what-activities",
    question: "What sorts of activities are you doing?",
    answer:
      "<p>Build Toronto's central activity is the release of frequent memos written by entrepreneurs, civic leaders, and policy thinkers. These memos focus on Toronto's biggest challenges — housing, governance, infrastructure, and economic competitiveness.</p>",
    order: 4,
    active: true,
  },
  {
    id: "why",
    question: "Why are you doing this?",
    answer:
      "<p>Toronto is Canada's largest city and economic engine. Its success is critical to the success of the country. Yet Toronto has struggled with gridlock, unaffordability, and political inertia. We think it can be much, much better.</p>",
    order: 5,
    active: true,
  },
  {
    id: "partisan",
    question: "Are you a partisan group?",
    answer:
      "<p>No. Build Toronto, like Build Canada, is non-partisan. We focus on ideas, not parties.</p>",
    order: 6,
    active: true,
  },
  {
    id: "lobby",
    question: "Is this a lobby group?",
    answer:
      "<p>No. Build Toronto is not a lobby group. It does not represent specific industries or special interests.</p>",
    order: 7,
    active: true,
  },
  {
    id: "involved",
    question: "How can I get involved?",
    answer:
      "<p>We welcome volunteers, entrepreneurs, and civic leaders who want to make a difference in Toronto. Email us at <a href=\"mailto:hi@buildcanada.com\">hi@buildcanada.com</a>.</p>",
    order: 8,
    active: true,
  },
  {
    id: "stay-up-to-date",
    question: "How can I stay up to date on your work?",
    answer:
      "<p>The best way to follow along is through the Build Toronto website and our social media accounts, as well as the Build Canada newsletter.</p>",
    order: 9,
    active: true,
  },
  {
    id: "contact",
    question: "How can I contact you?",
    answer:
      "<p>Email us at <a href=\"mailto:hi@buildcanada.com\">hi@buildcanada.com</a>, or connect with us on X, LinkedIn, Instagram, or BlueSky.</p>",
    order: 10,
    active: true,
  },
  {
    id: "why-start",
    question: "Why did you start this group?",
    answer:
      "<p>To champion bold ideas and innovative solutions that support Toronto's — and Canada's — long-term prosperity.</p>",
    order: 11,
    active: true,
  },
  {
    id: "donate",
    question: "Can I donate?",
    answer:
      "<p>While we're not structured as a nonprofit at this time, we appreciate the sentiment. The best way to support us right now is through engagement and amplification of our content.</p>",
    order: 12,
    active: true,
  },
];

function HeroSection() {
  return (
    <section className="px-6 sm:px-16 py-12 border-b border-border-light">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 md:gap-x-12 items-stretch">
        <div className="md:pr-12 md:border-r md:border-border-light flex md:items-center">
          <h1
            className="type-display text-dark"
            style={{ letterSpacing: "-0.126rem" }}
          >
            The Toronto we must build
          </h1>
        </div>
        <div className="mt-6 md:mt-0">
          <div className="type-body text-dark/70 space-y-4">
            <p>
              Toronto was never finished. It&rsquo;s still being built &mdash;
              by people who arrive with ambition, raise families with hope,
              and believe things can keep getting better. This city
              isn&rsquo;t a museum piece. It&rsquo;s a living project. And
              its best days are still ahead.
            </p>
            <p>
              Housing is scarce. Transit is incomplete. Infrastructure lags
              behind. City Hall still treats growth like a problem &mdash;
              and too often, we cheer for mediocrity and call it progress.
            </p>
            <p>
              We believe Toronto can be something greater: a magnet for
              talent, a home for young families, a global hub of culture,
              capital, and connection.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrinciplesSection() {
  return (
    <section
      id="principles"
      className="px-6 sm:px-16 py-12 border-b border-border-light"
    >
      <div className="max-w-screen-2xl mx-auto">
        <SectionLabel as="h2">Our principles</SectionLabel>
        <ol className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 list-none">
          {principles.map((p, i) => (
            <li
              key={p.title}
              className="border-t border-border-light pt-6 grid grid-cols-[3rem_1fr] gap-4"
            >
              <span className="type-h3 text-accent leading-none">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="type-h3 text-dark mb-2">{p.title}</h3>
                <p className="type-body text-dark/70">{p.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-12 max-w-[820px] type-body text-dark/80">
          <p>
            Build Toronto is a civic movement for those who want to see this
            city lead again. Not just in ambition. Not just in size. But in
            what a great city can be. Let&rsquo;s build the Toronto we know
            is possible &mdash; the greatest and freest city on earth.
          </p>
        </div>
      </div>
    </section>
  );
}

function LeadershipSection() {
  return (
    <section
      id="leadership"
      className="px-6 sm:px-16 py-12 border-b border-border-light"
    >
      <div className="max-w-screen-2xl mx-auto">
        <h3 className="type-h2 text-dark mb-12">Leadership</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <PersonCard
            name="Eric Lombardi"
            title="Chair, Build Toronto"
            photo={null}
            xUrl="https://x.com/EricLombardi"
            linkedinUrl="https://www.linkedin.com/in/eric-lombardi/"
          />
        </div>
        <p className="type-body text-dark/70 mt-10 max-w-[640px]">
          Build Toronto is supported by{" "}
          <a
            href="/about"
            className="underline underline-offset-2 hover:text-accent"
          >
            Build Canada
          </a>
          .
        </p>
      </div>
    </section>
  );
}

export default function TorontoAboutPage() {
  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
      <HeroSection />
      <QuickLinks links={quickLinks} />
      <PrinciplesSection />
      <LeadershipSection />
      <QnaBlock items={faqs} />
    </div>
  );
}
