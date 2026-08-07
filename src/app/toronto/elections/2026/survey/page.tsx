import type { Metadata } from "next";
import SurveyClient from "./SurveyClient";

export const metadata: Metadata = {
  title: "Neighbourhood Priorities Survey — Toronto 2026",
  description:
    "Tell us what matters most in your ward ahead of Toronto's October 26, 2026 municipal election. Six short steps.",
  alternates: { canonical: "/toronto/elections/2026/survey" },
  openGraph: {
    title: "Neighbourhood Priorities Survey — Toronto 2026 | Build Canada",
    description:
      "Tell us what matters most in your ward ahead of Toronto's 2026 municipal election.",
    type: "website",
  },
};

export default function SurveyPage() {
  return <SurveyClient />;
}
