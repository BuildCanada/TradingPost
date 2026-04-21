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

  return (
    <section id="faqs" className="px-6 sm:px-16 py-16">
      <div className="max-w-screen-2xl mx-auto">
        <SectionHeader label="FAQs" />
        <Accordion
          value={openValue}
          onValueChange={setOpenValue}
          className="mt-4 grid grid-cols-1 md:grid-cols-2 md:gap-x-12 items-start"
        >
          {items.map((item, i) => {
            const value = `qna-${i}`;
            const isOpen = openValue.includes(value);

            return (
              <AccordionItem
                key={item.id}
                value={value}
                className="border-b border-border-light first:border-t md:[&:nth-child(-n+2)]:border-t"
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
      </div>
    </section>
  );
}
