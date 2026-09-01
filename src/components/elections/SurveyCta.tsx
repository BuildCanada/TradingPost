import Link from "next/link";
import { ArrowRight } from "lucide-react";

/* An invitation to answer the same questions the candidates did.
 *
 * It sits beside "Know Your Candidates" rather than under it, because it is
 * the other half of the same idea: the grid says where the candidates stand,
 * and the only thing that turns that into a decision is where the reader
 * stands. A reader who has just read a column of answers is the likeliest
 * person on the site to have an opinion about them.
 *
 * Stacked under the heading on a phone, since a column beside a column of
 * answers is not something a narrow screen has room for.
 */
export function SurveyCta({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="group/cta grid content-start gap-2.5 border border-border-light p-5 transition-colors hover:border-dark lg:max-w-[320px]"
    >
      <p className="type-label text-accent">Voter survey</p>
      <p className="font-sans font-medium leading-[1.2] tracking-[-0.02em] text-[1.35rem] text-dark text-balance">
        Where do you stand?
      </p>
      <p className="font-serif text-[1rem] leading-[1.45] text-dark/80 text-pretty">
        Answer the same questions and see which candidates line up with you.
      </p>
      <span className="type-label-sm inline-flex items-center gap-1.5 text-accent group-hover/cta:underline">
        Take the survey
        <ArrowRight className="size-3.5 transition-transform group-hover/cta:translate-x-0.5" />
      </span>
    </Link>
  );
}
