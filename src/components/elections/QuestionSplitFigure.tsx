"use client";

import { useState } from "react";

import { OptionBar, percentOf } from "@/components/charts/trilemma";

/* The interactive half of a QuestionSplit card: the band, the legend, and the
 * panel of names behind each of them.
 *
 * THE CHART IS OptionBar, FROM THE CHARTS PACKAGE
 *   This was a hand-drawn donut first, and a donut is the wrong chart for this
 *   page twice over. The page's work is done across thirty-odd cards at once —
 *   where does the field agree, where does it split — and a share read as a
 *   length against a common left edge can be compared between cards, where an
 *   angle cannot. And a good many of the questions are a straight Yes/No,
 *   which is the case a pie serves worst: 72/28 is plain in a band and a
 *   judgement call in a circle.
 *
 *   OptionBar already draws exactly this — "one question's answers as a single
 *   100% band" — with the fade-all-but-one behaviour the legend needs, so the
 *   only thing here is the legend and the panel behind it.
 *
 * THE BAND CARRIES NO NUMBERS
 *   `showCounts` and `showLabels` are both off. The legend sits directly under
 *   the bar with every option's wording, count and share on it, so a segment
 *   printing its own share is the same figure twice, a centimetre apart — and
 *   the option names cannot fit under a narrow segment anyway, which is why
 *   OptionBar drops them. The bar is the shape; the legend is the key.
 *
 * WHY THE NAMES ARE BEHIND SOMETHING
 *   This page put every name under every question and the names were the
 *   clutter — thirty-odd plates, two dozen times, standing between the reader
 *   and the split. But they are still the evidence for the share, and a chart
 *   whose underlying roll call cannot be reached is a chart a reader has to
 *   take on trust. So the shares are the page and the names are one gesture
 *   away: the reader asks per question, on the one or two questions they care
 *   enough to ask about, instead of being handed all of them at once.
 *
 * THE BAND IS WHAT YOU HOVER
 *   A reader with a question about a share is pointing at the share — at the
 *   block of colour, not at the line of text under it. So the segments carry
 *   the hover, and hovering one both opens its names and picks its row out of
 *   the legend below. The rows themselves no longer answer to the pointer;
 *   they did first, and it put the tooltip somewhere the reader was not
 *   looking.
 *
 * BUT THE ROWS ARE STILL BUTTONS, FOR THE READERS WITH NO POINTER
 *   A 7% segment of a 32px band is about twenty pixels across on a phone,
 *   which is not a tap target, and no segment is reachable by keyboard at
 *   all. So the rows stay focusable and clickable: click latches a panel
 *   open, focus opens one, Escape and leaving the figure close it. What they
 *   no longer do is open on hover.
 *
 * THE PANEL TAKES NO POINTER
 *   It is `pointer-events-none`, and that is load-bearing rather than tidy.
 *   The panel hangs under the band, which puts it over the legend rows. Were
 *   it to catch the pointer, a row latched open by a click would be buried
 *   under the thing it opened, with no way to click it again to close — and
 *   back when the rows opened on hover it was worse: the panel took the hover
 *   off the row the moment it appeared, so the row fired mouseleave, the
 *   panel closed, the row fired mouseenter, and it strobed.
 *
 *   Transparent to the pointer, the rows stay clickable through it. Nothing in
 *   here is interactive, so nothing is lost — and nothing in here scrolls
 *   either, which is why the names are set in columns that fit rather than in
 *   a scrolling box.
 *
 */

/** The band's height, and so where the panel of names hangs from. */
const BAR = 32;

/* The width the band is drawn at until the browser has measured its container.
 *
 * `responsive` fits the bar to the card, but it fits it with a ResizeObserver,
 * which cannot run on the server — so the markup that ships carries whatever
 * width was asked for and snaps to the real one on hydration. OptionBar's own
 * default is 230px, which on a page of thirty-three cards is thirty-three
 * stubs that all jump at once. This is roughly a card in the two-up grid, so
 * the snap is a nudge rather than a jump. */
const BAR_WIDTH_BEFORE_MEASURE = 560;

export type SplitSlice = {
  key: string;
  /** the option as it was put to the candidates */
  label: string;
  color: string;
  /** who gave this answer, surname order, with their ballot line where the
   *  page tracks one */
  names: { key: string; name: string; seat?: string }[];
};

export function QuestionSplitFigure({
  slices,
  total,
  question,
}: {
  slices: SplitSlice[];
  /** everyone who answered this question — the denominator */
  total: number;
  /** the question itself, which is the band's accessible name */
  question: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  /* Opened by a click rather than by the pointer passing over, and so not the
     pointer's to close — which is the only thing a touch screen can do, since
     it has no hover to open one with. Leaving the figure, or Escape, lets it
     go. */
  const [pinned, setPinned] = useState(false);

  const close = () => {
    setOpen(null);
    setPinned(false);
  };
  /* A click on the row already showing latches it; a second one lets go. */
  const toggle = (key: string) => {
    if (pinned && open === key) close();
    else {
      setOpen(key);
      setPinned(true);
    }
  };
  const graze = (key: string | null) => {
    if (!pinned) setOpen(key);
  };

  const shown = slices.find((slice) => slice.key === open);
  /* OptionBar picks its one option out by position, not by key. */
  const highlight = slices.findIndex((slice) => slice.key === open);

  return (
    <div
      className="relative flex flex-col gap-3"
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
      /* The outer edge of the latch. Without it a pinned panel outlives the
         reader's interest in it — they read on down the page and it is still
         open behind them, and on a page of thirty-three cards several could
         be. */
      onMouseLeave={close}
    >
      <OptionBar
        options={slices.map((slice) => slice.label)}
        counts={slices.map((slice) => slice.names.length)}
        colors={slices.map((slice) => slice.color)}
        onSegmentEnter={(i) => graze(slices[i].key)}
        onSegmentLeave={() => graze(null)}
        /* -1 from findIndex is "no option", which OptionBar spells null. */
        highlight={highlight < 0 ? null : highlight}
        height={BAR}
        width={BAR_WIDTH_BEFORE_MEASURE}
        responsive
        showCounts={false}
        label={question}
      />

      <Legend
        slices={slices}
        total={total}
        open={open}
        onGraze={graze}
        onToggle={toggle}
      />

      {/* ONE PLACE, UNDER THE BAND — NOT UNDER THE ROW THAT OPENED IT

          Hung off its own legend row, the panel opened wherever that row
          happened to sit, so the fourth option on a four-option question put
          the names well below the chart they belong to — and the same gesture
          put the panel somewhere different on every option.

          Anchored to the band, it is a fixed distance from the thing it
          explains and lands in the same spot every time, with the segment it
          came from picked out directly above it. It overlaps the legend rows,
          which is the right trade: they are still there when it closes, and
          the alternative was distance. */}
      {shown && <Names slice={shown} />}
    </div>
  );
}

/* The options in full, in the order they were put to the candidates — never
 * sorted by size. A reader coming from a ward page has learned that the first
 * option is the first colour; resorting every card by its own result takes
 * that away and puts the legend in a different order on every question. */
function Legend({
  slices,
  total,
  open,
  onGraze,
  onToggle,
}: {
  slices: SplitSlice[];
  total: number;
  open: string | null;
  /** keyboard focus arriving on a row, which opens only while nothing is
   *  latched. The pointer is the band's business, not the legend's. */
  onGraze: (key: string | null) => void;
  /** a click, which latches — see `pinned` */
  onToggle: (key: string) => void;
}) {
  const share = percentOf(total);

  return (
    /* Ruled, not spaced. A gap alone left four answers reading as one block of
       prose with numbers down the side — the wordings are full sentences and
       the long ones wrap, so where one answer stopped and the next began was
       something the reader worked out from the text rather than saw. A
       hairline between them says it outright, and costs a line of grey. */
    <ul className="grid min-w-0 list-none m-0 p-0">
      {slices.map((slice, i) => {
        const shown = open === slice.key;
        return (
          <li
            key={slice.key}
            className={i > 0 ? "border-t border-border-light" : ""}
          >
            <button
              type="button"
              aria-expanded={shown}
              onClick={() => onToggle(slice.key)}
              onFocus={() => onGraze(slice.key)}
              onBlur={() => onGraze(null)}
              className={`grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-baseline gap-x-2.5 gap-y-0.5 py-2 text-left transition-opacity duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                open && !shown ? "opacity-45" : ""
              }`}
            >
              <span
                className="size-2.5 translate-y-[0.25em] rounded-full"
                style={{ background: slice.color }}
                aria-hidden="true"
              />
              {/* THE ANSWER, SET AS AN ANSWER

                  The ward and mayoral cards title each block with the wording
                  the candidates were shown, in serif at a size that makes it
                  the biggest thing inside the block. Here the same sentence
                  was set as body text at 1.02rem — so the one piece of the
                  card carrying what somebody actually endorsed looked like a
                  caption, and sat at the same weight as the names in the panel
                  and the note at the foot.

                  Same treatment as those cards, a step down in size because a
                  legend row is not a panel title: serif, medium, tracking
                  pulled in. An answer now reads as an answer wherever in the
                  tracker a reader meets it. */}
              <span
                className={`font-serif text-[1.12rem] font-medium leading-[1.3] tracking-[-0.015em] text-dark text-pretty decoration-border-light underline-offset-4 ${
                  shown ? "underline" : ""
                }`}
              >
                {slice.label}
              </span>
              <span className="font-sans text-[0.9rem] font-medium leading-none tabular-nums text-text-secondary">
                {slice.names.length}
                <span className="text-text-muted">
                  {" "}
                  · {share(slice.names.length)}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* Who gave this answer, set just below the band.
 *
 * Over the card rather than in the flow of it: a panel that pushed the legend
 * down would move the rows out from under the reader's cursor every time they
 * opened one, and shift every card beneath it on the page.
 *
 * The top offset is the band's own height and the gap under it, so the panel
 * meets the bottom of the bar whichever option opened it.
 *
 * Names as plain text, not as the bordered plates the ward pages use. A plate
 * is an object a reader counts in a field of four or five; forty of them in a
 * panel is a mosaic, and the count is already on the row that opened it. */
function Names({ slice }: { slice: SplitSlice }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-20 border border-dark bg-bg p-3 shadow-[0_6px_20px_rgba(0,0,0,0.1)]"
      style={{ top: `calc(${BAR}px + 0.75rem)` }}
    >
      <p className="type-label-sm text-text-muted">
        {slice.names.length === 1
          ? "1 candidate"
          : `${slice.names.length} candidates`}
      </p>
      {/* Columns, because a segment can hold forty people. In one run they are
          a list taller than the card, and this panel cannot be scrolled — it
          takes no pointer, by design. Three columns puts forty names in
          fourteen rows. */}
      <ul className="mt-1.5 list-none gap-1 m-0 p-0 columns-2 sm:columns-3">
        {slice.names.map((candidate) => (
          <li
            key={candidate.key}
            className="break-inside-avoid pb-1 font-sans text-[0.92rem] leading-[1.3] text-dark"
          >
            {candidate.name}
            {candidate.seat && (
              <span className="text-text-muted"> · {candidate.seat}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
