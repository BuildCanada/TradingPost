interface QandAItemData {
  question: string;
  answer: string;
}

export function generateFAQPageSchema(items: QandAItemData[]) {
  return {
    "@type": "FAQPage" as const,
    mainEntity: items.map((item) => ({
      "@type": "Question" as const,
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: item.answer,
      },
    })),
  };
}
