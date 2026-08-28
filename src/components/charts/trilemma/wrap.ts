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
