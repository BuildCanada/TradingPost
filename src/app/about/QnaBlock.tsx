"use client";

import { useState } from "react";
import SectionLabel from "@/components/SectionLabel";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionChevron,
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
  const [openValue, setOpenValue] = useState<string[]>([]);

  return (
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-border-light">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel as="h2">Q&amp;A</SectionLabel>
        <div className="mt-4 border border-border-light">
          <Accordion value={openValue} onValueChange={setOpenValue}>
            {qnaItems.map((item, i) => {
              const value = `qna-${i}`;
              const isOpen = openValue.includes(value);

              return (
                <AccordionItem
                  key={i}
                  value={value}
                  className="border-b-0 p-6"
                >
                  <AccordionTrigger
                    className="[&_[data-slot=accordion-trigger-icon]]:hidden flex items-center justify-between cursor-pointer group w-full text-left h-[44px] px-3 transition-colors rounded-none border-transparent hover:no-underline py-0 [&]:bg-transparent"
                  >
                    <h3
                      className={`type-h2 transition-colors duration-200 ${
                        isOpen ? "text-accent" : "text-dark group-hover:text-accent"
                      }`}
                    >
                      {item.question}
                    </h3>
                    <AccordionChevron isOpen={isOpen} />
                  </AccordionTrigger>
                  <AccordionContent
                    panelClassName="accordion-expand"
                    className="overflow-hidden"
                  >
                    <div className="mt-4">
                      <p className="type-body text-dark leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
