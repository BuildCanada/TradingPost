import Link from "next/link";
import { cn } from "@/lib/utils";

const baseStyles =
  "group/btn type-label inline-flex items-center gap-2 px-5 py-3 cursor-pointer transition-colors";

const variants = {
  charcoal:
    "bg-charcoal-1000 text-linen-100 border border-charcoal-1000 hover:bg-auburn-800 hover:border-auburn-800",
  auburn:
    "bg-auburn-800 text-white border border-auburn-800 hover:opacity-80",
  ghost:
    "bg-transparent text-dark border border-border-light hover:text-dark hover:border-dark",
  linen:
    "bg-linen-100 text-charcoal-1000 border border-linen-100 hover:bg-white hover:border-white",
  "linen-ghost":
    "bg-transparent text-linen-100 border border-transparent hover:text-white",
};

function RightArrow() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0 transition-transform duration-200 group-hover/btn:translate-x-1"
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DiagonalArrow() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
    >
      <path
        d="M4 12l8-8M6 4h6v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type CommonProps = {
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
};

type LinkProps = CommonProps & {
  as?: "link";
  href: string;
};

type ExternalLinkProps = CommonProps & {
  as: "external-link";
  href: string;
};

type ButtonElProps = CommonProps & {
  as: "button";
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

type ButtonProps = LinkProps | ExternalLinkProps | ButtonElProps;

export function Button(props: ButtonProps) {
  const { variant = "charcoal", className, children } = props;
  const classes = cn(baseStyles, variants[variant], className);

  if (props.as === "external-link") {
    // A new tab only makes sense for a page. mailto:/tel: hand off to another
    // app, and target="_blank" on those strands an empty tab behind them.
    const opensTab = /^https?:/.test(props.href);
    return (
      <a
        href={props.href}
        {...(opensTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={classes}
      >
        {children}
        <DiagonalArrow />
      </a>
    );
  }

  if (props.as === "button") {
    return (
      <button
        onClick={props.onClick}
        type={props.type ?? "button"}
        disabled={props.disabled}
        className={cn(classes, props.disabled && "disabled:opacity-50")}
      >
        {children}
      </button>
    );
  }

  // Default: internal link
  return (
    <Link href={props.href} className={classes}>
      {children}
      <RightArrow />
    </Link>
  );
}
