import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Outcomes Tracker - Build Canada",
  description:
    "Frequently asked questions about the Build Canada Outcomes Tracker.",
  alternates: { canonical: "/tracker/faq" },
};

const FAQS: { question: string; answer: React.ReactNode }[] = [
  {
    question: "Why did you build this?",
    answer:
      "We wanted to better understand what is being done in key areas that matter to Canadians like us. We built this tracker to know what key commitments have been made, what their progress has been, and how they impact outcomes.",
  },
  {
    question: "Where do commitments come from?",
    answer:
      "We have pulled commitments from the Liberal Party's platform. We show the original text and the source in each commitment's details. As new commitments are made, we will add these in.",
  },
  {
    question: "Where do metrics and targets come from?",
    answer:
      "In cases where the Liberal Party has provided a metric and/or target, we use that. In other cases, we set a metric based on the policy's intention. In each graph, we show where the target source comes from.",
  },
  {
    question:
      "How are the progress, impact, and alignment scores calculated?",
    answer: (
      <>
        We use an LLM to score each of these. Our project is open sourced on{" "}
        <a
          href="https://github.com/BuildCanada"
          className="underline hover:text-[#8b2332] transition-colors"
        >
          Github
        </a>
        .
      </>
    ),
  },
  {
    question: "How can I contribute?",
    answer: (
      <>
        This is a work in progress and we would love help from others. Join us
        on{" "}
        <a
          href="https://discord.gg/VmbBSXKMve"
          className="underline hover:text-[#8b2332] transition-colors"
        >
          Discord
        </a>
        .
      </>
    ),
  },
  {
    question: "How can I get in touch?",
    answer: (
      <>
        You can reach out to us at{" "}
        <a
          href="mailto:hi@buildcanada.com"
          className="underline hover:text-[#8b2332] transition-colors"
        >
          hi@buildcanada.com
        </a>
        .
      </>
    ),
  },
];

export default function TrackerFaqPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
      <div className="space-y-6">
        {FAQS.map(({ question, answer }) => (
          <div key={question}>
            <h2 className="text-lg font-semibold mb-2">{question}</h2>
            <p className="text-gray-900">{answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
