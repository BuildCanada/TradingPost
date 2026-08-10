import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Constitution",
  description:
    "The principles that guide Build Canada in its mission to make Canada the most prosperous country in the world.",
  alternates: {
    canonical: "/constitution",
  },
};

const principles = [
  {
    title: "Growth is good.",
    body: "When someone builds a business, Canadians collectively win. Businesses create jobs, opportunities and tax revenue. A growing, thriving economy driven by private enterprise is essential to support the kind of things Canadians value such as healthcare, high quality education, and modern infrastructure.",
  },
  {
    title: "Building beats complaining.",
    body: "Anyone can point at what’s broken; we’re focused on the actions needed for Canada to reach its true potential.",
  },
  {
    title: "Bold beats safe.",
    body: "Striving for first place means making bold choices. There will not always be consensus around what needs to be done and that’s ok. We need to build at the pace the country needs, not the pace consensus allows.",
  },
  {
    title: "People are individuals with agency.",
    body: "We believe every person is capable, responsible for their own path, and able to change it.",
  },
  {
    title: "People should be judged on merit.",
    body: "Talent, effort, and results should determine outcomes. Nothing else. Everyone deserves a fair starting line and nobody is owed a particular finish.",
  },
  {
    title: "Ideas should be judged on merit.",
    body: "Open discussion about unpopular or difficult topics is critical for a healthy democracy. We embrace this discourse and reject ad hominem attacks and attempts to silence debate.",
  },
  {
    title: "Equal treatment is essential.",
    body: "Rules and laws must be clear, predictable, and equally applied to everyone.",
  },
];

export default function ConstitutionPage() {
  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-hidden">
      <article className="animate-fade-in">
        <header className="border-b border-border-light px-5 py-12 sm:px-10 sm:py-16 md:px-16 md:py-24">
          <div className="mx-auto max-w-[1080px]">
            <p className="type-label mb-5 text-accent">Build Canada</p>
            <h1 className="type-display max-w-[12ch] text-dark">
              Constitution
            </h1>
            <p className="type-body mt-8 max-w-[38ch] text-dark">
              Build Canada&rsquo;s mission is to make Canada the most prosperous
              country in the world.
            </p>
            <p className="type-label mt-8 text-text-muted">
              These principles guide our work.
            </p>
          </div>
        </header>

        <ol className="mx-auto max-w-[1080px] border-x border-border-light">
          {principles.map((principle, index) => (
            <li
              key={principle.title}
              className="grid gap-5 border-b border-border-light px-5 py-9 last:border-b-0 sm:px-10 md:grid-cols-[56px_minmax(0,1fr)] md:gap-8 md:px-12 md:py-12"
            >
              <span className="type-label pt-1 text-accent" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="max-w-[760px]">
                <h2 className="type-title-sm text-dark">{principle.title}</h2>
                <p className="type-body mt-4 text-text-secondary">
                  {principle.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </article>
    </div>
  );
}
