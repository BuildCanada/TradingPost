"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface QnaItem {
  id: string;
  question: string;
  answer: string;
}

export default function QnaBlock({ items }: { items: QnaItem[] }) {
  const [openValue, setOpenValue] = useState<string[]>([]);

  const leftItems = items.filter((_, i) => i % 2 === 0);
  const rightItems = items.filter((_, i) => i % 2 === 1);

  const renderColumn = (column: { item: QnaItem; index: number }[]) => (
    <Accordion
      value={openValue}
      onValueChange={setOpenValue}
      className="flex flex-col"
    >
      {column.map(({ item, index }) => {
        const value = `qna-${index}`;
        const isOpen = openValue.includes(value);

        return (
          <AccordionItem
            key={item.id}
            value={value}
            className="border-b border-border-light first:border-t"
          >
            <AccordionTrigger
              className="[&_[data-slot=accordion-trigger-icon]]:hidden flex items-center justify-between cursor-pointer group w-full text-left py-4 transition-colors rounded-none border-transparent hover:no-underline [&]:bg-transparent"
            >
              <h3
                className={`type-h4 transition-colors duration-200 ${
                  isOpen ? "text-accent" : "text-dark group-hover:text-accent"
                }`}
              >
                {item.question}
              </h3>
              <span
                className={`shrink-0 ml-4 transition-transform duration-200 ${
                  isOpen ? "text-accent rotate-180" : "text-accent"
                }`}
              >
                &#x25BE;
              </span>
            </AccordionTrigger>
            <AccordionContent
              panelClassName="accordion-expand"
              className="overflow-hidden"
            >
              <div
                className="pb-4 text-dark [&_p]:text-base [&_p]:leading-relaxed [&_p:not(:last-child)]:mb-3 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-accent"
                dangerouslySetInnerHTML={{ __html: item.answer }}
              />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );

  return (
    <section id="faqs" className="px-6 sm:px-16 py-16">
      <div className="max-w-screen-2xl mx-auto">
        <SectionHeader label="FAQs" />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 md:gap-x-12 items-start">
          {renderColumn(leftItems.map((item, i) => ({ item, index: i * 2 })))}
          {renderColumn(rightItems.map((item, i) => ({ item, index: i * 2 + 1 })))}
        </div>
      </div>
    </section>
  );
}
