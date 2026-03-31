"use client";

import { useState } from "react";
import SectionLabel from "@/components/SectionLabel";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionIconCircle,
  AccordionChevron,
  AccordionBulletList,
} from "@/components/ui/accordion";

const platformItems = [
  {
    title: "Prosperous",
    description: "An economy where starting a business is simple, growing one is possible, and success is celebrated.",
    color: "#1F5F7F",
    icon: "/assets/icons/crane.svg",
    expandedHeader: "We stand for lower regulatory burden, competitive taxation, faster permitting, and a government that sees enterprise as the engine of national prosperity — not a resource to be extracted from.",
    expandedBullets: [
      "Accelerate housing construction by cutting zoning restrictions and permitting delays",
      "Modernize national infrastructure — transit, broadband, and energy grids",
      "Pursue fiscal discipline that lowers the cost of living and keeps capital in Canada",
    ],
  },
  {
    title: "Fast",
    description: "Impatient with decline when builders have all the right tools to help Canada succeed.",
    color: "#1B7A33",
    icon: "/assets/icons/fast.svg",
    expandedHeader: "The countries that move fastest on policy, permits, and delivery will win the next decade. We must remove the obstacles — bureaucratic, regulatory, and cultural — that have turned Canada into a country where it takes years to accomplish what should take months.",
    expandedBullets: [
      "Remove ideological and partisan borders on policy that makes it easier to build",
      "Push public service to move faster and more efficient",
      "Shape our national conversation towards identifying areas of contention and platforming powerful solutions",
    ],
  },
  {
    title: "Free",
    description: "Free markets, merit-based systems, and a fair starting line for every Canadian builder.",
    color: "#BE4A10",
    icon: "/assets/icons/increase.svg",
    expandedHeader: "Canada thrives when markets are open, competition is real, and merit is the standard. We champion the removal of genuine barriers while preserving the rewards that flow from effort and ability. The question is always the same: Can you do the work?",
    expandedBullets: [
      "Defend free markets and merit-based systems that let the best ideas and businesses win",
      "Remove regulatory barriers that prevent small businesses and startups from competing",
      "Create tax incentives that reward risk-taking, investment, and job creation",
    ],
  },
  {
    title: "Sovereign",
    description: "Own our supply chains, defend our borders, and build for Canadians.",
    color: "#7B23CD",
    icon: "/assets/icons/newmapleleaf.svg",
    expandedHeader: "No one can beat you when ambition translates to excellence. This country was built with intention and it will continue as such. We believe we must build to get ahead.",
    expandedBullets: [
      "True sovereignty comes from the ability to build what we need ourselves — energy, technology, defence, and infrastructure",
      "Invest in domestic defence manufacturing and Arctic infrastructure",
      "Build housing, infrastructure, energy, and industry at the pace and scale the country demands",
    ],
  },
];

export default function PlatformBlock() {
  const [openValue, setOpenValue] = useState<string[]>([]);

  return (
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-border-light">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel>Our Principles</SectionLabel>
        <h2 className="type-h3 text-dark mt-2 mb-1">Builders believe Canada should be...</h2>
        <div className="mt-4 border border-border-light">
          <Accordion value={openValue} onValueChange={setOpenValue}>
            {platformItems.map((item) => {
              const isOpen = openValue.includes(item.title);

              return (
                <AccordionItem key={item.title} value={item.title} className="border-b-0 p-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <AccordionIconCircle icon={item.icon} isOpen={isOpen} />
                    </div>

                    <div className="flex-1">
                      <AccordionTrigger
                        className="[&_[data-slot=accordion-trigger-icon]]:hidden flex items-center justify-between cursor-pointer group w-full text-left h-[44px] px-3 transition-colors rounded-none border-transparent hover:no-underline py-0 [&]:bg-transparent"
                      >
                        <h3
                          className={`type-h2 transition-colors duration-200 ${
                            isOpen ? "text-accent" : "text-dark group-hover:text-accent"
                          }`}
                        >
                          {item.title}
                        </h3>
                        <AccordionChevron isOpen={isOpen} />
                      </AccordionTrigger>
                      <AccordionContent
                        panelClassName="accordion-expand"
                        className="overflow-hidden"
                      >
                        <div className="mt-4 px-3">
                          <p className="type-body text-dark leading-relaxed">
                            {item.expandedHeader}
                          </p>
                          <AccordionBulletList items={item.expandedBullets} />
                        </div>
                      </AccordionContent>
                    </div>
                  </div>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
