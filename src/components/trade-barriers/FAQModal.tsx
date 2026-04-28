"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronDown, ChevronRight } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is the Trade Barriers Tracker?",
    answer:
      "This dashboard tracks agreements amongst Canadian provinces and territories that reduce or eliminate barriers to trade and labour mobility.\n\nIt shows commitments that have been made, the scope of each agreement, which governments are participating, and the current status of implementation.",
  },
  {
    question: "What is an interprovincial trade barrier?",
    answer:
      "Internal trade barriers should not be thought of as light switches (i.e. either trade is permitted or it is not). Rather, they are costs incurred on account of transacting across internal borders.\n\nExamples include: varying driver qualifications for long-combination vehicles, inconsistent definition of sunrise and sunset for trucking restrictions, divergent technical safety rules, duplicative end-of-life reporting requirements for producers of electronics.",
  },
  {
    question: "What do the statuses mean?",
    answer:
      "- Awaiting Sponsorship: These are known barriers that have not been added as an item to an agenda\n- Under Negotiation: Jurisdictions are negotiating the item, but an agreement has not yet been reached\n- Agreement Reached: The jurisdictions have reached an agreement to address the item\n- Partially Implemented: At least one jurisdiction has implemented the agreement\n- Implemented: All jurisdictions have fully implemented the agreement\n- Deferred: Jurisdictions have deferred addressing the item",
  },
  {
    question: "Why does this matter?",
    answer:
      "Canada's internal trade barriers are estimated to cost over $200 billion each year (equivalent to 7.9% of Canada's GDP) by limiting the free movement of goods, services, and people across provincial borders.\n\nTracking agreements helps citizens, businesses, and policymakers see where progress is being made—and where more work is needed.",
  },
  {
    question: "Where does the data come from?",
    answer:
      "We aggregate across reports and press releases of individual governments and agencies, the Council of the Federation, the Committee on Internal Trade, and the Canadian Free Trade Agreement's (i) Internal Trade Secretariat and (ii) Regulatory Reconciliation and Cooperation Table, and more.",
  },
  {
    question: "How often is the Tracker updated?",
    answer:
      "Updates are published as new agreements are announced or progress is verified.",
  },
  {
    question: "Is this an official government site?",
    answer:
      "No. Build Canada is a non-partisan civic initiative. The Tracker compiles publicly available information to increase transparency.",
  },
  {
    question: "What should I do if I notice something wrong or incomplete?",
    answer:
      "We make our best efforts to be accurate, but may not get everything right! We'd love your help with improvements or corrections. Email us at hi@buildcanada.com.",
  },
];

export default function FAQModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-[60]" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 w-[90vw] max-w-2xl z-[60] max-h-[80vh] overflow-y-auto p-6 rounded-md">
          <Dialog.Title className="text-xl font-mono font-semibold uppercase tracking-wide text-gray-900 mb-4">
            Frequently Asked Questions
          </Dialog.Title>

          <div className="space-y-4">
            {faqData.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-md">
                <button
                  onClick={() => toggle(i)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-mono font-medium text-gray-900 text-sm">
                    {item.question}
                  </span>
                  {expanded.has(i) ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {expanded.has(i) && (
                  <div className="px-4 pb-3">
                    <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {item.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Dialog.Close
            aria-label="Close dialog"
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
