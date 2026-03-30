"use client";

import { useState } from "react";
import SectionLabel from "@/components/SectionLabel";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

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

const baseFontSize = 18;
const expandedFontSize = Math.round(baseFontSize * 1.5);

export default function PlatformBlock() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-[var(--color-border-light)]">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel>Our Principles</SectionLabel>
        <h2 className="type-heading text-[var(--color-dark)] mt-2 mb-1">Builders believe Canada should be...</h2>
        <div className="flex flex-col gap-3 mt-3">
          {platformItems.map((item, i) => {
            const isOpen = openIndex === i;

            return (
              <Collapsible
                key={item.title}
                open={isOpen}
                onOpenChange={(open) => setOpenIndex(open ? i : null)}
              >
                <div
                  className="border flex cursor-pointer transition-colors duration-200 hover:bg-[var(--color-border-light)]/20"
                  style={{ borderColor: isOpen ? item.color : undefined }}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <div
                    className="w-[56px] shrink-0 flex items-center justify-center border-r transition-colors duration-200"
                    style={{
                      backgroundColor: isOpen ? item.color : undefined,
                      borderColor: isOpen ? item.color : undefined,
                    }}
                  >
                    <div
                      className="platform-icon-wiggle w-[20px] h-[20px] transition-colors duration-200"
                      style={{
                        backgroundColor: isOpen ? "#ffffff" : item.color,
                        maskImage: `url(${item.icon})`,
                        maskSize: "contain",
                        maskRepeat: "no-repeat",
                        maskPosition: "center",
                        WebkitMaskImage: `url(${item.icon})`,
                        WebkitMaskSize: "contain",
                        WebkitMaskRepeat: "no-repeat",
                        WebkitMaskPosition: "center",
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1 px-5 py-4">
                    <svg
                      className="overflow-visible block"
                      height={24}
                      style={{
                        transformOrigin: "left center",
                        willChange: "transform",
                        transform: isOpen ? "scaleX(1.25) scaleY(0.82)" : undefined,
                        transition: "transform 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      }}
                    >
                      <text
                        y="18"
                        style={{
                          fontFamily: '"Test Soehne", sans-serif',
                          fontSize: isOpen ? expandedFontSize : baseFontSize,
                          fontWeight: isOpen ? 700 : 500,
                          fill: isOpen ? item.color : "var(--color-dark)",
                          transition: "font-size 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275), font-weight 150ms, fill 150ms",
                        }}
                      >
                        {item.title}
                      </text>
                    </svg>
                    <p className="type-caption text-[var(--color-text-secondary)] mt-1">{item.description}</p>
                  </div>
                </div>
                <CollapsibleContent className="accordion-expand">
                  <div>
                    <div className="px-5 py-3 border-x border-b" style={{ borderColor: isOpen ? item.color : undefined }}>
                      <p className="type-body text-[var(--color-dark)] mb-3 leading-relaxed">
                        {item.expandedHeader}
                      </p>
                      <ul className="space-y-1.5">
                        {item.expandedBullets.map((bullet, j) => (
                          <li key={j} className="type-caption text-[var(--color-text-secondary)] flex items-start gap-2">
                            <span className="mt-[5px] w-[5px] h-[5px] rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </section>
  );
}
