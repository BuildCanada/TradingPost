"use client";

import {
  MUTED,
  OptionBar,
  TOKENS,
  TrilemmaDial,
  layoutDial,
  palette,
  percentOf,
  type AxisConfig,
  type Triple,
} from "@/components/charts/trilemma";

/* How a questionnaire's field split on one question.
 *
 * Shared by the ward pages, which draw it per candidate, and the survey's
 * comparison view, which draws it per question against the resident's own
 * answer. Both are the same picture — the whole field's split with one
 * position picked out of it — and the moment they were drawn by two files
 * they started to differ: different radii, different labels, different
 * denominators for the same percentages.
 *
 * FORM
 *   A three-way choice between competing alternatives gets a dial: a circle
 *   in equal thirds, one wedge per option, reaching out as far as the share
 *   that picked it. Everything else gets a segmented bar — "Yes / Yes, with
 *   conditions / No" is ordered, and a dial would set those three at 120° from
 *   each other as though they were rivals rather than points on a scale, and a
 *   four-option question cannot be a trilemma at all.
 *
 *   One value scale across every chart on a page (`fieldSize`), so a wedge
 *   that reaches the rim always means the same thing. Per-question scales
 *   would make every answer look unanimous.
 */

/* Big enough for the option names to sit around the rim at a readable size,
 * and to stay the loudest thing in its column. The bar matches its width so
 * the two chart forms line up down a page of mixed questions. */
export const CHART_SIZE = 360;

/**
 * The option's name, cut to something that can go around a rim.
 *
 * Most of the questionnaire names its options in a word or two — "Permission",
 * "Regulator and enabler" — and those go on the chart whole. A handful put a
 * whole sentence in the label instead ("Decrease after inflation, with some
 * responsibilities and funding transferred to civilian services"), and there
 * is no size of dial that reads with three of those around it. Those dials
 * used to go unlabelled altogether, which left the reader a circle of three
 * anonymous thirds and a list to match it against by colour alone.
 *
 * So the rim gets the head of the option — everything before its first comma,
 * and at most a few words of that — with an ellipsis saying plainly that it is
 * a stub. It is enough to tell the thirds apart ("Increase above inflation…",
 * "Remain approximately constant…", "Decrease after inflation…"), which is all
 * a rim label is for. The options are printed in full immediately above the
 * chart, each with its own wedge glyph, so nothing is lost: the short form
 * points at the full wording rather than replacing it.
 */
const RIM_LABEL_MAX = 30;

/* A stub must not end on a word that is only pointing at the one that got cut:
 * "Increase above inflation to…" reads as a sentence someone abandoned, where
 * "Increase above inflation…" reads as a heading. */
const DANGLING = new Set([
  "a",
  "an",
  "and",
  "at",
  "by",
  "for",
  "from",
  "in",
  "of",
  "on",
  "or",
  "than",
  "the",
  "to",
  "with",
]);

export function rimLabel(option: string): string {
  const head = option.split(",")[0].trim();
  if (head === option && head.length <= RIM_LABEL_MAX) return option;

  const words: string[] = [];
  for (const word of head.split(/\s+/)) {
    if (words.length && [...words, word].join(" ").length > RIM_LABEL_MAX) break;
    words.push(word);
  }
  while (words.length > 1 && DANGLING.has(words.at(-1)!.toLowerCase()))
    words.pop();

  return `${words.join(" ")}…`;
}

/** A note pinned to one option's rim label — "· you", and nothing longer. */
export type AxisMark = { index: number; text: string };

/** The shape of a question, which is all the chart needs to choose its form. */
export type ChartShape = {
  options: string[];
  /** the options are points on a scale rather than rival alternatives */
  ordinal?: boolean;
};

export const isDial = (shape: ChartShape) =>
  shape.options.length === 3 && !shape.ordinal;

/* The mark goes on *after* the trim, or it is the first thing the trim eats:
 * "Along corridors and transit" is already at the rim's limit, and a suffix
 * added before shortening simply vanishes. */
const dialAxes = (shape: ChartShape, mark?: AxisMark) =>
  shape.options.map((option, i) => ({
    key: String(i),
    label:
      i === mark?.index
        ? `${rimLabel(option)} ${mark.text}`
        : rimLabel(option),
  })) as unknown as Triple<AxisConfig>;

/**
 * One outer radius for every dial on a page — the smallest any of them can
 * manage with its own option names around the rim.
 *
 * Without this each dial sizes itself to its own labels, so a question with
 * short options draws a bigger circle, and the shared value scale the page
 * rests on quietly stops being true: the same count would reach further on one
 * question than on another.
 */
export function sharedRadius(shapes: ChartShape[]): number | undefined {
  const dials = shapes.filter(isDial);
  if (dials.length === 0) return undefined;

  return Math.min(
    ...dials.map(
      (shape) =>
        layoutDial({
          width: CHART_SIZE,
          height: CHART_SIZE,
          padding: 4,
          axes: dialAxes(shape),
          showGoalLabels: true,
          showValues: true,
          hasLabel: false,
        }).R,
    ),
  );
}

/**
 * The chart's fills for one question: the chosen option in its own corner
 * hue, every other option in the neutral.
 *
 * The corner hues are what make the option's *position* legible — the first
 * option is the same colour on all thirty-odd questions, so "they picked the
 * first one again" is visible without reading. A choice of `null` (nobody's
 * position to show, or an answer that matched no option) leaves the whole
 * chart neutral: the field's shape still reads, but none of it is claimed.
 */
export function optionColors(count: number, choice: number | null) {
  const full = palette(count);
  return {
    full,
    colors: full.map((c, i) => (i === choice ? c : MUTED)),
    // Every option's share has to be readable, including the ones drawn in the
    // unchosen neutral — which is a fill, far too pale to set type in.
    valueColors: full.map((c, i) => (i === choice ? c : TOKENS.light.inkFaint)),
  };
}

export function AnswerChart({
  shape,
  counts,
  choice,
  fieldSize,
  radius,
  ariaLabel,
  mark,
  colors: colorsProp,
  valueColors: valueColorsProp,
  valueFormat,
}: {
  shape: ChartShape;
  /** how many of the field picked each option, in the options' order */
  counts: number[];
  /** the option to pick out of the field, or null to leave it all neutral */
  choice: number | null;
  /** the whole field — the top of the shared value scale */
  fieldSize: number;
  /** the page's shared outer radius, from `sharedRadius` */
  radius?: number;
  ariaLabel: string;
  /**
   * A note on one option's rim label. The comparison view names the reader's
   * own option there, since every wedge on that page already carries its
   * option's colour and so cannot also carry "this one is yours".
   */
  mark?: AxisMark;
  /** Wedge fills, where the default (only `choice` in colour) is not wanted. */
  colors?: string[];
  /** Colour for each printed value; defaults to matching the wedges. */
  valueColors?: string[];
  /**
   * How a count reads at the rim. Defaults to a share of the field — right
   * where the field is thirty-odd candidates, wrong where it is four, and the
   * comparison view passes a plain count instead.
   */
  valueFormat?: (n: number) => string;
}) {
  const counted = counts.reduce((a, b) => a + b, 0);
  if (counted === 0) return null;

  const defaults = optionColors(shape.options.length, choice);
  const colors = colorsProp ?? defaults.colors;
  const valueColors = valueColorsProp ?? colorsProp ?? defaults.valueColors;
  const format = valueFormat ?? percentOf(fieldSize);

  return (
    /* The chart's own accessible name would be the dial's generic fallback,
       which names neither the question nor whose position is picked out.
       Naming the group instead makes the svg inside presentational, so it is
       announced once and in the terms a reader needs. */
    <div className="mt-auto flex justify-center pt-1" role="img" aria-label={ariaLabel}>
      {isDial(shape) ? (
        <TrilemmaDial
          axes={dialAxes(shape, mark)}
          values={counts as unknown as Triple<number>}
          domain={[0, Math.max(1, fieldSize)]}
          width={CHART_SIZE}
          /* The box closes up around the circle and its labels rather than
             staying the square the width implies — at a forced radius that
             square is mostly empty air, and on a phone, where the svg scales
             to the column, the air scales with it. */
          height={radius === undefined ? undefined : 2 * radius + 104}
          radiusOverride={radius}
          padding={4}
          innerRadius={0.14}
          /* The options around the rim and their shares under them: the chart
             says what each third is and how many went there, without the
             reader crossing to the list to find out. */
          showGoalLabels
          valueMode="outside"
          valueFormat={format}
          /* One quiet ring at half the field, so a wedge's reach can be read
             as a share rather than only against its neighbours. */
          showRings
          ringStep={0.5}
          cornerColors={colors as Triple<string>}
          valueColors={valueColors as Triple<string>}
          interactive={false}
          paper="var(--color-bg)"
        />
      ) : (
        <OptionBar
          options={shape.options}
          counts={counts}
          colors={colors}
          valueFormat={format}
          width={CHART_SIZE}
          height={34}
          showLabels
        />
      )}
    </div>
  );
}
