import parse from "html-react-parser";
import { chartFenceSource } from "@/lib/charts/chart-fence";
import { InlineChart } from "./InlineChart";

/** Preserve the CMS's trusted HTML, replacing only explicitly marked chart fences. */
export function ArticleBody({ html }: { html: string }) {
  // Keep the existing rendering path for all content without chart blocks.
  if (!html.includes("buildcanada-chart")) {
    return (
      <div className="prose-bc" dangerouslySetInnerHTML={{ __html: html }} />
    );
  }
  return (
    <div className="prose-bc">
      {parse(html, {
        replace(node) {
          const source = chartFenceSource(node);
          if (source === null) return;
          return <InlineChart source={source} />;
        },
      })}
    </div>
  );
}
