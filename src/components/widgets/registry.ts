import dynamic from "next/dynamic";
import { WidgetComponent } from "./types";

const registry: Record<string, WidgetComponent> = {
  "outcomes-tracker": dynamic(() => import("./OutcomesTrackerWidget")),
  "builder-mp": dynamic(() => import("./BuilderMPWidget")),
  "tax-dollars": dynamic(() => import("./TaxDollarsWidget")),
  "great-builders": dynamic(() => import("./GreatBuildersWidget")),
  "canada-spends": dynamic(() => import("./CanadaSpendsWidget")),
  "trade-barriers": dynamic(() => import("./TradeBarriersWidget")),
  "exit-tax-calculator": dynamic(() => import("./ExitTaxWidget")),
};

export default registry;
