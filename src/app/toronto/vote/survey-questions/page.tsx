import type { Metadata } from "next";
import { DownloadPdfButton } from "./DownloadPdfButton";
import {
  ADDITIONAL,
  STAGE_ONE,
  STAGE_TWO,
  type ChoiceQuestion,
} from "./questions";

export const metadata: Metadata = {
  title: "Candidate Questionnaire — Toronto 2026",
  description:
    "The full set of questions Build Canada is asking Toronto's 2026 municipal candidates.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

function OptionList({ options }: { options: ChoiceQuestion["options"] }) {
  return (
    <ul className="mt-5 grid gap-px bg-border-light md:grid-cols-3">
      {options.map(({ label, body }) => (
        <li
          key={label}
          className="bg-bg px-5 py-5 flex flex-col gap-2 print:border print:border-black/20"
        >
          <span className="type-label text-accent">{label}</span>
          <span className="font-serif text-[1rem] leading-[1.5] text-dark/85">
            {body}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function SurveyQuestionsPage() {
  return (
    <div className="theme-election bg-bg text-dark">
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="px-6 py-16 md:px-14 md:py-20 border-b-2 border-dark">
          <p className="type-label text-accent mb-6">
            Toronto 2026 · Candidate questionnaire
          </p>
          <h1 className="font-sans font-medium leading-[0.95] tracking-[-0.04em] text-[clamp(2.5rem,6vw,4.75rem)] max-w-[22ch] text-balance mb-8">
            Every question we&rsquo;re asking Toronto&rsquo;s candidates.
          </h1>
          <p className="font-serif text-[clamp(1.1rem,1.6vw,1.4rem)] leading-[1.55] max-w-[62ch] text-dark/85 mb-10">
            Five yes-or-no questions, sixteen trilemmas, and ten additional
            questions on the choices facing the next council. Every question
            also carries an optional text box for a candidate&rsquo;s own
            comments.
          </p>
          <DownloadPdfButton />
        </section>

        {/* ── Stage One ────────────────────────────────────────── */}
        <section className="border-b-2 border-dark px-6 py-14 md:px-14 md:py-20">
          <header className="mb-10">
            <p className="type-label text-accent mb-4">Stage One</p>
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(2rem,3.5vw,3rem)]">
              Yes / No
            </h2>
          </header>
          <ol className="grid gap-px bg-border-light">
            {STAGE_ONE.map(({ id, topic, question }) => (
              <li
                key={id}
                className="bg-bg py-7 flex flex-col gap-3 md:flex-row md:gap-8"
              >
                <div className="md:w-[16rem] md:shrink-0">
                  <span className="type-label text-accent">
                    {id} · {topic}
                  </span>
                </div>
                <p className="font-serif text-[1.15rem] leading-[1.55] max-w-[62ch]">
                  {question}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Stage Two ────────────────────────────────────────── */}
        <section className="border-b-2 border-dark px-6 py-14 md:px-14 md:py-20">
          <header className="mb-4">
            <p className="type-label text-accent mb-4">Stage Two</p>
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(2rem,3.5vw,3rem)]">
              Trilemmas
            </h2>
          </header>

          {STAGE_TWO.map(({ id, number, title, questions }) => (
            <div key={id} className="mt-14 first:mt-10">
              <h3 className="font-sans font-medium leading-[1.1] tracking-[-0.03em] text-[clamp(1.5rem,2.2vw,2rem)] pb-4 border-b border-border-light">
                <span className="text-border-light mr-3">{number}</span>
                {title}
              </h3>
              {questions.map(({ id: qid, question, options }) => (
                <article key={qid} className="mt-10">
                  <p className="font-sans font-medium text-[1.2rem] leading-[1.35] tracking-[-0.02em] max-w-[64ch]">
                    <span className="text-accent mr-2">{qid}</span>
                    {question}
                  </p>
                  <OptionList options={options} />
                </article>
              ))}
            </div>
          ))}
        </section>

        {/* ── Additional questions ─────────────────────────────── */}
        <section className="px-6 py-14 md:px-14 md:py-20">
          <header className="mb-10">
            <p className="type-label text-accent mb-4">Additional Questions</p>
            <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(2rem,3.5vw,3rem)]">
              Ten more choices
            </h2>
          </header>

          {ADDITIONAL.map(({ id, topic, question, options }) => (
            <article key={id} className="mt-12 first:mt-0">
              <p className="font-sans font-medium text-[1.2rem] leading-[1.35] tracking-[-0.02em] max-w-[64ch]">
                <span className="text-accent mr-2">{id} · {topic}</span>
                {question}
              </p>
              <OptionList options={options} />
            </article>
          ))}

          <div className="mt-16 pt-10 border-t-2 border-dark">
            <DownloadPdfButton />
          </div>
        </section>
      </div>
    </div>
  );
}
