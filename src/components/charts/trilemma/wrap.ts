/** Greedy word wrap for corner labels, so a long goal name doesn't squeeze the plot. */
export function wrapLabel(text: string, maxChars = 16): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    if (!line) line = w
    else if ((line + ' ' + w).length <= maxChars) line += ' ' + w
    else {
      lines.push(line)
      line = w
    }
  }
  if (line) lines.push(line)
  return lines
}

export const widestLine = (lines: string[]) => Math.max(...lines.map((l) => l.length))

/**
 * Wrap for a label with a hard ceiling on its lines — the segmented bar, where
 * a name only has its own segment's width to sit in. Returns [] rather than a
 * truncation when the name will not fit: half a label under a bar reads as a
 * mistake, and the list beside the chart still carries it in full.
 */
export function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const lines = wrapLabel(text, maxChars)
  return lines.length <= maxLines && widestLine(lines) <= maxChars + 2 ? lines : []
}
