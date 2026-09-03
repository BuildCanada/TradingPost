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
 * Loud on purpose. It was a bordered card in the page's own colours, at the
 * page's own type size, which is the shape of a footnote: beside a heading set
 * at three times its weight it read as something already dealt with. So on a
 * desktop it takes the accent as a fill and the heading as a size — the only
 * solid block of colour on the page, and the only thing on it that is not
 * either a question or an answer. On a phone it keeps the same colours at a
 * smaller size, stacked under the heading, where there is no room for a second
 * column and nothing to compete with anyway.
 */
export function SurveyCta({
  href,
  className = "lg:min-w-[380px] lg:max-w-[440px]",
}: {
  href: string;
  /** width and placement, which differ by slot — beside a heading on the
   *  candidate pages, filling a panel or centred on the landing page */
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group/cta block border-2 border-dark bg-accent p-6 text-bg transition-colors hover:bg-dark lg:p-8 ${className}`}
    >
      <p className="type-label text-bg/70">Voter survey</p>

      <p className="mt-3 font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[1.75rem] lg:text-[2.125rem] text-balance">
        Where do you stand?
      </p>

      <p className="mt-3 font-serif text-[1.05rem] leading-[1.4] text-bg/85 text-pretty">
        Answer the same questions we put to the candidates and see who lines up
        with you.
      </p>

      {/* A button rather than a link with an arrow: the card is the control,
          and this is what says so at a glance. */}
      <span className="type-button mt-5 inline-flex items-center gap-2 bg-bg px-5 py-3 text-dark">
        Take the survey
        <ArrowRight className="size-3.5 transition-transform group-hover/cta:translate-x-0.5" />
      </span>
    </Link>
  );
}
