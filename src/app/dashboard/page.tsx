import type { Metadata } from "next";

import "@buildcanada/charts/styles.css";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Interactive data dashboard rendered with the Build Canada charts library.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
