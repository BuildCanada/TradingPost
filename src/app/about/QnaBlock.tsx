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

interface QnaItem {
  id: string;
  question: string;
  answer: string;
}

export default function QnaBlock({ items }: { items: QnaItem[] }) {
  const [openValue, setOpenValue] = useState<string[]>([]);

  if (items.length === 0) return null;

  return (
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px]">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel as="h2">Questions &amp; Answers</SectionLabel>
        <div className="mt-4 border border-border-light">
          <Accordion value={openValue} onValueChange={setOpenValue}>
            {items.map((item, i) => {
              const value = `qna-${i}`;
              const isOpen = openValue.includes(value);

              return (
                <AccordionItem
                  key={item.id}
                  value={value}
                  className="border-b-0 p-6"
                >
                  <AccordionTrigger
                     className="[&_[data-slot=accordion-trigger-icon]]:hidden flex items-center justify-between cursor-pointer group w-full text-left h-[48px] px-3 transition-colors rounded-none border-transparent hover:no-underline py-0 [&]:bg-transparent"
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
                    <div className="mt-4 px-3">
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
