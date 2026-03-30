import { FAQPage, Question } from "schema-dts";

export interface FAQItem {
  question: string;
  answer: string;
}

export function createFAQPage(items: FAQItem[]): FAQPage {
  const questions: Question[] = items.map((item) => ({
    "@type": "Question" as const,
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer" as const,
      text: item.answer,
    },
  }));

  return {
    "@type": "FAQPage",
    mainEntity: questions.length === 1 ? questions[0] : questions,
  };
}
