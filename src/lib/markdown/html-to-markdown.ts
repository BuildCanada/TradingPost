import { unified, type Plugin } from "unified";
import type { Root, Element } from "hast";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";

// York Factory bodies reference site-relative assets (/assets/...); markdown
// consumers fetch documents out of browser context, so links must be absolute.
const rehypeAbsoluteUrls: Plugin<[{ baseUrl: string }], Root> = ({ baseUrl }) => {
  const absolutize = (value: unknown): unknown =>
    typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
      ? `${baseUrl}${value}`
      : value;

  const visit = (node: Root | Element) => {
    if (node.type === "element") {
      if (node.properties.href) node.properties.href = absolutize(node.properties.href) as string;
      if (node.properties.src) node.properties.src = absolutize(node.properties.src) as string;
    }
    for (const child of node.children) {
      if (child.type === "element") visit(child);
    }
  };

  return visit;
};

export async function htmlToMarkdown(
  html: string,
  opts: { baseUrl: string },
): Promise<string> {
  if (!html.trim()) return "";
  const file = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeAbsoluteUrls, { baseUrl: opts.baseUrl })
    .use(rehypeRemark)
    .use(remarkGfm)
    .use(remarkStringify, { bullet: "-", emphasis: "_", rule: "-" })
    .process(html);
  return String(file).trim();
}
