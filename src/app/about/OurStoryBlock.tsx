"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SectionLabel from "@/components/SectionLabel";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const firstMemos = [
  { title: "Canadians are Ready to Build", slug: "ready-to-build", author: "Build Canada" },
  { title: "Free Zoning to Build More Homes", slug: "housing-zoning", author: "Julie Di Lorenzo" },
  { title: "Use Industrial Policy to Claim Canada's Place in Space", slug: "claim-space", author: "Mina Mitry" },
];

function TwitterEmbed() {
  useEffect(() => {
    if (!document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')) {
      const s = document.createElement("script");
      s.src = "https://platform.twitter.com/widgets.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div className="max-w-[480px]">
      <blockquote className="twitter-tweet" data-theme="light">
        <p lang="en" dir="ltr">Canada is a Nation of Builders 🇨🇦🏗️ <a href="https://t.co/DCud9QpINW">pic.twitter.com/DCud9QpINW</a></p>
        &mdash; Build Canada (@build_canada) <a href="https://twitter.com/build_canada/status/1996331071885992086">December 3, 2025</a>
      </blockquote>
    </div>
  );
}

const storyItems = [
  {
    key: "founding",
    title: "A Canada in Crisis",
    icon: "/assets/icons/book-list-icon.svg",
    content: (
      <div className="space-y-4">
        <p className="type-body text-[var(--color-dark)] leading-relaxed">
          Canada&apos;s productivity is slipping. GDP per Capita, Worker Productivity, Inflation, and other domestic economic measures of health across the board are declining.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/images/productivity-growth-by-country-oecd.webp" alt="Bar chart showing OECD productivity growth by country from 2019 to 2024, with Canada ranking near the bottom at less than 0.5 percent" className="w-full border border-[var(--color-border-light)]" />
            <p className="type-label-sm text-[var(--color-text-muted)] mt-1">Source: <a href="https://data.oecd.org/lprdty/gdp-per-hour-worked.htm" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-accent)] transition-colors">OECD</a></p>
          </div>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/images/canada-falling-standard-of-living.webp" alt="Line chart comparing Canada and U.S. real GDP per capita from 2016 to 2023, showing Canada's standard of living falling behind" className="w-full border border-[var(--color-border-light)]" />
            <p className="type-label-sm text-[var(--color-text-muted)] mt-1">Source: <a href="https://www.theglobeandmail.com/business/commentary/article-cost-of-living-crisis-data-perception/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-accent)] transition-colors">The Globe and Mail</a>, NBF Economics and Strategy</p>
          </div>
        </div>

        <p className="type-body text-[var(--color-dark)] leading-relaxed">
          Build Canada started because a group of founders looked at the data — falling productivity, declining investment, rising brain drain — and decided to stop waiting for someone else to fix it. What began as a conversation became a movement: bold policy ideas that spread across the country and sparked a national conversation about the Canada we could build.
        </p>

        <div>
          <p className="type-label-sm text-[var(--color-text-muted)] mb-2">The First 3 Build Canada Memos</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {firstMemos.map((memo) => (
              <Link
                key={memo.slug}
                href={`/memos/${memo.slug}`}
                className="border border-[var(--color-border-light)] p-3 flex flex-col gap-1.5 group hover:bg-[var(--color-border-light)]/20 transition-colors"
              >
                <h4 className="type-caption font-sans font-medium tracking-tight group-hover:text-[var(--color-accent)] transition-colors line-clamp-2" style={{ lineHeight: 1.1 }}>
                  {memo.title}
                </h4>
                <p className="type-label-sm text-[var(--color-text-secondary)]">
                  {memo.author}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "publishing",
    title: "Ideas for a Better Canada",
    icon: "/assets/icons/court-list-icon.svg",
    content: (
      <div className="space-y-4">
        <p className="type-body text-[var(--color-dark)] leading-relaxed">
          Build Canada isn&apos;t just commentary. We take pride in our carefully crafted Policy Memos published by prominent Canadian Builders at the forefront of the new economy.
        </p>

        <div className="border-t border-[var(--color-border-light)] pt-3">
          <p className="type-label text-[var(--color-accent)]">Success Story: SR&amp;ED Reforms</p>
        </div>

        <div className="max-w-[480px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/images/shopify-sred-policy-reform-article.webp" alt="Canadian Press article headline: Shopify helps feds with key piece of budget policy on SR&ED reform" className="w-full border border-[var(--color-border-light)]" />
          <p className="type-label-sm text-[var(--color-text-muted)] mt-1">Source: <a href="https://www.thecanadianpressnews.ca/national/ottawa-is-rebooting-its-relationship-with-the-tech-industry-advocates-say/article_38f627a3-3087-58a1-bb49-aeeb1993582e.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-accent)] transition-colors">The Canadian Press</a>, Nov 2025</p>
        </div>

        <p className="type-body text-[var(--color-dark)] leading-relaxed">
          Back in July of 2025, the Federal Government approached Shopify seeking their input for a series of desired SR&amp;ED reforms. Shopify President Harley Finkelstein had already published a memo on Build Canada&apos;s platform criticizing the program&apos;s complexity.
        </p>

        <p className="type-body text-[var(--color-dark)] leading-relaxed">
          Shopify handed back a complete SR&amp;ED redesign based on what was in Harley&apos;s Build Canada memo within 48 hours. As Prime Minister Mark Carney later <a href="https://panow.com/2025/11/22/ottawa-is-rebooting-its-relationship-with-the-tech-industry-advocates-say/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-accent)] transition-colors">told the Chamber of Commerce of Metropolitan Montreal</a>: &ldquo;We went to Shopify and said, &apos;Can you help us redesign this process?&apos; Somewhat embarrassingly, they came back in 48 hours and said, &apos;Do this.&apos;&rdquo;
        </p>

        <p className="type-body text-[var(--color-dark)] leading-relaxed">
          The result: Budget 2025 included sweeping SR&amp;ED reforms — upfront funding approval instead of rebates, doubled annual expenditure limits to $6 million, and AI-powered audits to reduce bureaucratic burden. A $4.5 billion program that had become bogged down by consultants absorbing 25–33% of every dollar was finally getting fixed — and it started with a Build Canada memo.
        </p>

        <Link
          href="/memos/fix-sred"
          className="border border-[var(--color-border-light)] p-3 flex flex-col gap-1.5 group hover:bg-[var(--color-border-light)]/20 transition-colors"
        >
          <h4 className="type-caption font-sans font-medium tracking-tight group-hover:text-[var(--color-accent)] transition-colors" style={{ lineHeight: 1.1 }}>
            Fix Canada&apos;s Primary R&amp;D Program
          </h4>
          <p className="type-label-sm text-[var(--color-text-secondary)]">
            Harley Finkelstein
          </p>
        </Link>

        <p className="type-body text-[var(--color-dark)] leading-relaxed">
          There are many more stories like this now, and more unravelling. Together we can bring into existence the policy which makes us sovereign, prosperous, and (most importantly) fast.
        </p>
      </div>
    ),
  },
  {
    key: "culture",
    title: "Shifting Culture",
    icon: "/assets/icons/light-list-icon.svg",
    content: null as React.ReactNode,
  },
];

const socialLinks = [
  { icon: "/assets/icons/platform-x-twitter.svg", href: "https://x.com/build_canada", label: "X" },
  { icon: "/assets/icons/platform-linkedin.svg", href: "https://www.linkedin.com/company/buildcanada", label: "LinkedIn" },
  { icon: "/assets/icons/platform-instagram.svg", href: "https://www.instagram.com/build_canada/", label: "Instagram" },
  { icon: "/assets/icons/substack-icon.svg", href: "https://buildcanada.substack.com/", label: "Substack" },
  { icon: "/assets/icons/platform-youtube.svg", href: "https://www.youtube.com/@BuildCanada", label: "YouTube" },
];

export default function OurStoryBlock() {
  const [openValue, setOpenValue] = useState<string[]>([]);
  const [twitterLoaded, setTwitterLoaded] = useState(false);

  useEffect(() => {
    if (openValue.includes("culture") && !twitterLoaded) {
      setTwitterLoaded(true);
    }
  }, [openValue, twitterLoaded]);

  return (
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-[var(--color-border-light)]">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel>Our Story</SectionLabel>
        <div className="mt-4">
            <Accordion value={openValue} onValueChange={setOpenValue}>
            {storyItems.map((item, i) => {
              const isOpen = openValue.includes(item.key);
              const isLast = i === storyItems.length - 1;

              return (
                <AccordionItem key={item.key} value={item.key} className="border-b-0">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-[36px] h-[36px] mt-1 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                          isOpen
                            ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
                            : "bg-[var(--color-bg)] border-[var(--color-border-light)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                        }`}
                      >
                        <div
                          className="w-[16px] h-[16px]"
                          style={{
                            backgroundColor: "currentColor",
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
                      {!isLast && (
                        <div
                          className="w-[2px] flex-1 rounded-full transition-colors duration-300 mt-1.5 mb-1.5"
                          style={{
                            backgroundColor: isOpen ? "var(--color-accent)" : "var(--color-border-light)",
                          }}
                        />
                      )}
                    </div>

                    <div className={`flex-1 ${isLast ? "" : "pb-5"}`}>
                      <AccordionTrigger
                        className="[&_[data-slot=accordion-trigger-icon]]:hidden flex items-center justify-between cursor-pointer group w-full text-left h-[44px] px-3 transition-colors rounded-none border-transparent hover:no-underline py-0 [&]:bg-transparent"
                      >
                        <h3
                          className={`type-heading text-[14px] transition-colors duration-200 ${
                            isOpen ? "text-white" : "text-[var(--color-dark)] group-hover:text-[var(--color-accent)]"
                          }`}
                        >
                          {item.title}
                        </h3>
                        <span
                          className={`story-chevron text-[14px] transition-transform duration-200 ${
                            isOpen ? "text-white" : "text-[var(--color-text-secondary)]"
                          }`}
                        >
                          &#x25BE;
                        </span>
                      </AccordionTrigger>
                      <AccordionContent
                        panelClassName="accordion-expand"
                        className="overflow-hidden"
                      >
                        <div className="mt-4">
                          {item.content}
                          {item.key === "culture" && (                            <div className="space-y-4">
                              <p className="type-body text-[var(--color-dark)] leading-relaxed">
                                Policy alone won&apos;t fix Canada — culture has to shift too. We&apos;re working to rebuild a national identity rooted in ambition, competence, and urgency. That means celebrating builders, challenging complacency, and making it unacceptable to settle for mediocrity. We are a nation of Builders, after all.
                              </p>

                              {twitterLoaded && <TwitterEmbed />}

                              <div className="flex items-center gap-3 pt-1">
                                <p className="type-label-sm text-[var(--color-dark)]">Follow us on socials:</p>
                                <div className="flex items-center gap-1.5">
                                  {socialLinks.map(({ icon, href, label }) => (
                                    <a
                                      key={label}
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label={label}
                                      className="w-7 h-7 flex items-center justify-center hover:opacity-70 transition-opacity"
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={icon} alt={label} width={16} height={16} className="brightness-0 opacity-50 hover:opacity-90 transition-opacity" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
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
