import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { TorontoLockup } from "../election-og";
import {
  OG_SIZE,
  PledgeOGImage as PledgeOG,
  type PledgeOGTheme,
} from "@/components/elections/pledge-og";

export { logoDataUri } from "../election-og";
export { OG_SIZE };

/* Toronto's binding of the shared pledge OG template
   (@/components/elections/pledge-og): the Toronto-blue palette, the stamp
   under public/, and the nav's Toronto lockup in the corner. */

const TORONTO_THEME: PledgeOGTheme = {
  paper: "#e3ecf6",
  dark: "#272727",
  ink: "#2e5fa3",
  muted: "#4c4c4c",
  postmarkDate: "26.10.2026",
  postmarkCity: "TORONTO · #02026",
  voteDayLine: "Toronto votes Monday, October 26",
};

/* The stamp artwork lives under public/ — the only asset directory shipped
   into the production (Docker) runtime image, where this renders on demand
   for shared-pledge URLs. Reading from src/ here 500'd in production. */
export async function stampDataUri(): Promise<string> {
  try {
    const data = await readFile(
      join(process.cwd(), "public/elections/toronto/2026/toronto-stamp-og.png"),
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
      theme={TORONTO_THEME}
      lockup={<TorontoLockup logoSrc={logoSrc} />}
    />
  );
}
