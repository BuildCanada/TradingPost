"use client";

import SectionLabel from "@/components/SectionLabel";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const qnaItems = [
  {
    question: "Is Build Canada affiliated with a political party?",
    answer:
      "No. Build Canada is non-partisan. Our work is driven by one question: how do we make Canada the most prosperous country in the world?",
  },
  {
    question: "How is Build Canada funded?",
    answer:
      "We\u2019re a federally incorporated non-profit organization funded by over 60 individual donors who believe in building a stronger country. We don\u2019t accept government grants or public funding, which keeps us independent.",
  },
  {
    question: "Is Build Canada a lobby group?",
    answer:
      "No. We produce research, build community among Canadian founders and operators, and share policy ideas in public.",
  },
  {
    question: "Do you support a specific policy platform?",
    answer:
      "We champion ideas that make Canada a better place to build and grow our economy \u2014 whether that means tax reform, talent retention, infrastructure investment, or regulatory modernization. If you want to learn more about where we stand and our latest ideas, follow along with our content \u2014 we\u2019re always publishing new ideas and perspectives from builders across the country.",
  },
];

export default function QnaBlock() {
  return (
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-[var(--color-border-light)]">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel>Q&amp;A</SectionLabel>
        <div className="mt-2">
          <Accordion type="single" collapsible>
            {qnaItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`qna-${i}`}
                className="py-3 border-b border-[var(--color-border-light)] last:border-b-0"
              >
                <AccordionTrigger
                  className="[&_[data-slot=accordion-trigger-icon]]:hidden w-full flex items-center justify-between gap-3 text-left cursor-pointer group rounded-none border-transparent py-0 hover:no-underline"
                >
                  <span className="type-heading text-[15px] text-[var(--color-dark)] group-hover:opacity-70 transition-opacity">
                    {item.question}
                  </span>
                  <span className="w-[18px] h-[18px] border border-[var(--color-border-light)] flex items-center justify-center text-[12px] text-[var(--color-text-muted)] shrink-0 transition-colors group-hover:border-[var(--color-dark)]">
                    <span className="qna-open">+</span>
                    <span className="qna-close hidden">\u2212</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent
                  panelClassName="accordion-expand"
                  className="overflow-hidden"
                >
                  <p className="type-body text-[var(--color-dark)] pt-2 leading-relaxed">
                    {item.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
