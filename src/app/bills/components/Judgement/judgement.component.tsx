import { CheckCircle2, XCircle, CircleMinus } from "lucide-react";
import React from "react";

export type JudgementValue = "yes" | "no" | "abstain";
type Size = "sm" | "md";

const stylesByJudgement: Record<
  JudgementValue,
  {
    wrap: { subtle: string; outline: string };
    iconWrap: string;
    icon: string;
  }
> = {
  yes: {
    wrap: {
      subtle: "bg-pine-50 text-pine-900 border-pine-200",
      outline: "bg-white text-pine-900 border-pine-300",
    },
    iconWrap: "bg-pine-100 text-pine-700 border-pine-200",
    icon: "text-pine-700",
  },
  no: {
    wrap: {
      subtle: "bg-auburn-50 text-auburn-900 border-auburn-200",
      outline: "bg-white text-auburn-900 border-auburn-300",
    },
    iconWrap: "bg-auburn-100 text-auburn-700 border-auburn-200",
    icon: "text-auburn-700",
  },
  abstain: {
    wrap: {
      subtle: "bg-steel-50 text-charcoal-900 border-steel-200",
      outline: "bg-white text-charcoal-900 border-steel-300",
    },
    iconWrap: "bg-steel-100 text-charcoal-700 border-steel-200",
    icon: "text-charcoal-700",
  },
};

const sizes: Record<
  Size,
  { pad: string; text: string; icon: string; gap: string }
> = {
  sm: { pad: "p-1", text: "text-xs", icon: "h-4 w-4", gap: "gap-2" },
  md: { pad: "p-3", text: "text-base", icon: "h-5 w-5", gap: "gap-3" },
};

interface JudgementProps {
  judgement: JudgementValue;
  size?: Size;
  className?: string;
}

function verdictCopy(j: JudgementValue) {
  switch (j) {
    case "yes":
      return "Vote Yes";
    case "no":
      return "Vote No";
    default:
      return "Abstain";
  }
}

export function Judgement({
  judgement,
  size = "sm",
  className,
}: JudgementProps) {
  const s = stylesByJudgement[judgement];
  const sz = sizes[size];

  const Icon =
    judgement === "yes"
      ? CheckCircle2
      : judgement === "no"
        ? XCircle
        : CircleMinus;

  return (
    <article
      role="status"
      aria-live="polite"
      className={["border w-fit px-2", s.wrap.subtle, sz.pad, className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={`flex items-center ${sz.gap}`}>
        <span
          className={[
            "inline-flex items-center justify-center border ",
            sz.icon,
            s.iconWrap,
          ].join(" ")}
          aria-hidden="true"
        >
          <Icon className={`${sz.icon} ${s.icon}`} />
        </span>

        <span className={`font-medium leading-none ${sz.text}`}>
          {verdictCopy(judgement)}
        </span>
      </div>
    </article>
  );
}

export type { JudgementProps };
