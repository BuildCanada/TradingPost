import { SectionHeader } from "@/components/ui/section-header";

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

export default function PrinciplesBlock() {
  return (
    <section
      id="principles"
      className="px-6 sm:px-16 py-12 border-b border-border-light"
    >
      <div className="max-w-screen-2xl mx-auto">
        <SectionHeader label="Principles" />
        <ol className="mt-4 grid grid-cols-1 md:grid-cols-2 md:gap-x-12">
          {principles.map((principle, index) => (
            <li
              key={principle.title}
              className="grid grid-cols-[40px_minmax(0,1fr)] gap-4 border-b border-border-light py-6 first:border-t md:[&:nth-child(2)]:border-t"
            >
              <span className="type-label pt-1 text-accent" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="type-h4 text-dark">{principle.title}</h3>
                <p className="type-body mt-3 text-text-secondary">
                  {principle.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
