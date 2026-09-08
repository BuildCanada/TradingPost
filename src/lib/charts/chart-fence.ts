import type { DOMNode, Element } from "html-react-parser";

function textContent(node: DOMNode | Element["children"][number]): string {
  if (node.type === "text") return node.data;
  return "children" in node ? node.children.map(textContent).join("") : "";
}

export function chartFenceSource(node: DOMNode): string | null {
  if (node.type !== "tag" || node.name !== "pre") return null;
  const code = node.children.find(
    (child) => child.type === "tag" && child.name === "code",
  );
  if (code?.type !== "tag") return null;
  // Commonmark uses a language class; Commonmarker's syntax highlighter uses
  // pre[lang] and wraps the JSON in spans. Accept both without losing text.
  if (
    node.attribs.lang !== "buildcanada-chart" &&
    !code.attribs.class?.split(/\s+/).includes("language-buildcanada-chart")
  )
    return null;
  // Node discriminants work even when parser dependencies have separate Text constructors.
  return textContent(code);
}
