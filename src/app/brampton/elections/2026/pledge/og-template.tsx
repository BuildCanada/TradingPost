import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  CityLockup,
  PledgeOGImage as PledgeOG,
  type PledgeOGTheme,
} from "@/components/elections/pledge-og";

export { OG_SIZE, logoDataUri } from "@/components/elections/pledge-og";

/* Brampton's binding of the shared pledge OG template
   (@/components/elections/pledge-og): the site's default linen-and-auburn
   palette, the Brampton "Flower City" stamp, and the nav lockup in the
   corner. */

const PAPER = "#f6ece3";
const AUBURN = "#932f2f";

const BRAMPTON_THEME: PledgeOGTheme = {
  paper: PAPER,
  dark: "#272727",
  ink: AUBURN,
  muted: "#4c4c4c",
  postmarkDate: "26.10.2026",
  postmarkCity: "BRAMPTON · #02026",
  voteDayLine: "Brampton votes Monday, October 26",
  // The "Flower City" stamp puts its title across the top-left, so the mark
  // sits higher and further right, over a backing so the name stays readable.
  postmark: { top: -84, left: -18, backing: "rgba(246, 236, 227, 0.9)" },
};

/* The stamp artwork lives under public/ — the only asset directory shipped
   into the production (Docker) runtime image, where this renders on demand for
   shared-pledge URLs. Reading from src/ here 500's in production. */
export async function stampDataUri(): Promise<string> {
  try {
    const data = await readFile(
      join(process.cwd(), "public/elections/brampton/2026/brampton-stamp-og.png"),
      "base64",
    );
    return `data:image/png;base64,${data}`;
  } catch {
    return ""; // degraded stamp-less image beats a broken share card
  }
}

export function PledgeOGImage({
  stampSrc,
  name,
  logoSrc = "",
}: {
  stampSrc: string;
  /** when set, the stamp is postmarked and the headline names the pledger */
  name?: string;
  /** data URI from logoDataUri(); the corner lockup falls back to text without it */
  logoSrc?: string;
}) {
  return (
    <PledgeOG
      stampSrc={stampSrc}
      name={name}
      theme={BRAMPTON_THEME}
      lockup={
        <CityLockup
          logoSrc={logoSrc}
          city="Brampton"
          background={AUBURN}
          divider={PAPER}
        />
      }
    />
  );
}
