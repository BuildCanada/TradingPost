import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  CityLockup,
  PledgeOGImage as PledgeOG,
  type PledgeOGTheme,
} from "@/components/elections/pledge-og";

export { OG_SIZE, logoDataUri } from "@/components/elections/pledge-og";

/* Hamilton's binding of the shared pledge OG template
   (@/components/elections/pledge-og): the site's default linen-and-auburn
   palette, the Hamilton stamp, and the nav lockup in the corner. */

const PAPER = "#f6ece3";
const AUBURN = "#932f2f";

const HAMILTON_THEME: PledgeOGTheme = {
  paper: PAPER,
  dark: "#272727",
  ink: AUBURN,
  muted: "#4c4c4c",
  postmarkDate: "26.10.2026",
  postmarkCity: "HAMILTON · #02026",
  voteDayLine: "Hamilton votes Monday, October 26",
};

/* The stamp artwork lives under public/ — the only asset directory shipped
   into the production (Docker) runtime image, where this renders on demand for
   shared-pledge URLs. Reading from src/ here 500's in production. */
export async function stampDataUri(): Promise<string> {
  try {
    const data = await readFile(
      join(process.cwd(), "public/elections/hamilton/2026/hamilton-stamp-og.png"),
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
      theme={HAMILTON_THEME}
      lockup={
        <CityLockup
          logoSrc={logoSrc}
          city="Hamilton"
          background={AUBURN}
          divider={PAPER}
        />
      }
    />
  );
}
