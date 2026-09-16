import Image from "next/image";

/* A candidate's face, or their initials where we have no picture.
 *
 * WHY A COMPONENT
 *   The mayoral card, the ward card and now the questionnaire's rows all print
 *   the same plate: a dark square, the photo cropped to fill it, the initials
 *   centred in it when there is no photo. Three copies of it had drifted only
 *   in the one way that matters — the `sizes` hint, which is what decides how
 *   large a file the browser actually fetches — so it is one component with the
 *   hint derived from the size rather than typed out beside it.
 *
 * WHY INITIALS AND NOT A BLANK
 *   Toronto's ballot is 388 names and we hold a picture for 44 of them, so on
 *   most lists most rows have nothing. A plate that appears only where there is
 *   a photo leaves the names starting in two different places down one column,
 *   which reads as a fault in the page rather than as a fact about the ballot.
 *   The monogram fills the slot, keeps the column straight, and says the same
 *   thing the empty plate would: we have no picture of this person.
 */

/** The three plates this site prints, from the questionnaire's rows up to a
 *  ward card. Each carries its own type size and its own `sizes` hint. */
const SIZES = {
  sm: { box: "size-7", type: "text-[0.7rem]", hint: "28px" },
  md: { box: "size-12", type: "text-[1rem]", hint: "48px" },
  lg: { box: "size-16", type: "text-[1.35rem]", hint: "64px" },
} as const;

export function CandidatePortrait({
  candidate,
  size = "md",
  className = "",
}: {
  candidate: { name: string; image?: string; initials?: string };
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const { box, type, hint } = SIZES[size];

  return (
    <div
      className={`flex-none ${box} bg-dark relative overflow-hidden flex items-center justify-center font-sans font-medium ${type} tracking-[-0.02em] text-bg${
        className ? ` ${className}` : ""
      }`}
    >
      {candidate.image ? (
        <Image
          src={candidate.image}
          alt={candidate.name}
          fill
          sizes={hint}
          className="object-cover object-center"
        />
      ) : (
        /* `aria-hidden`, because the name is always printed beside this. Read
           out, "DB" before "Darrell Brown" is the name twice, the first time
           spelled. */
        <span aria-hidden="true">{candidate.initials}</span>
      )}
    </div>
  );
}
