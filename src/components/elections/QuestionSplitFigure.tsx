"use client";

import { useState } from "react";

import { OptionPie, percentOf } from "@/components/charts/trilemma";

/* The interactive half of a QuestionSplit card: the pie, the legend, and the
 * panel of names behind each of them.
 *
 * THE CHART IS OptionPie, AND THIS IS THE SECOND TIME ROUND
 *   It was a hand-drawn donut first. That was replaced by OptionBar, a single
 *   100% band, on an argument this file used to make at length and which has
 *   not stopped being true: the page's work is done across thirty-odd cards at
 *   once — where does the field agree, where does it split — and a share read
 *   as a length against a common left edge can be compared between cards,
 *   where an angle cannot. Twenty-six of the thirty-three questions are also
 *   an ordered scale, yes / yes-with-conditions / no, which a band keeps in
 *   order along its length. Five more have two options, where a pie is two
 *   slices and a number would have done.
 *
 *   It is a pie again because that was the call. Recorded rather than argued
 *   so that whoever weighs it next has the reasoning in front of them instead
 *   of rediscovering it: OptionBar is still exported and still takes these
 *   exact props, so going back is this component's import and its figure.
 *
 * THE PIE CARRIES NO NUMBERS
 *   The legend sits directly under it with every option's wording, count and
 *   share on it, so a slice printing its own share is the same figure twice, a
 *   centimetre apart — and an option wording here runs to ninety characters,
 *   which no slice can hold. The pie is the shape; the legend is the key.
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
 * THE PANEL IS A POPOVER, AND IT DOES TAKE THE POINTER
 *   It hangs under the pie and lies across the legend rows, and a slice on
 *   the city-wide page can hold fifty-five names — so it runs past the foot of
 *   its own card and over the cards below, which stay laid out as though
 *   nothing were there. That is what an overlay is; it is bounded by the
 *   window rather than by a guess at how many names is too many, and it leads
 *   with the answer it is the evidence for. See `Names`.
 *
 *   Scrolling means it has to take the pointer, and there was a spell when it
 *   could not: back when the legend rows opened on hover, the panel covering
 *   them stole the hover the instant it appeared, so the row fired mouseleave,
 *   the panel closed, the row fired mouseenter, and it strobed. That is gone
 *   with the trigger — hover lives on the band now, which the panel starts
 *   below and never covers. Nothing it overlaps opens it any more.
 *
 *   What it does still bury is the row you would click a second time to let a
 *   latched panel go, so clicking the panel closes it too.
 *
 */

/** The band's height, and so where the panel of names hangs from. */
/* The pie's drawn size. The names panel is positioned off it, so the two are
   one constant rather than two that can drift. */
const PIE = 148;

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
      /* `@container` so the names panel can size its columns against the card
         instead of the window — but it carries a cost worth naming: a
         container is `contain: layout`, which makes this a stacking context
         where a bare `position: relative` was not. The panel's own `z-20`
         used to lift it above everything on the page; scoped to this figure
         it only orders it against its siblings here, and the card below —
         later in the tree, and exactly what the panel opens over — would
         paint on top of it.

         So the whole figure lifts while a panel is open. Only while: left
         permanently raised, thirty-three of these would stack in tree order
         for no reason. */
      className={`@container relative flex flex-col gap-3 ${
        open ? "z-30" : ""
      }`}
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
      /* The outer edge of the latch. Without it a pinned panel outlives the
         reader's interest in it — they read on down the page and it is still
         open behind them, and on a page of thirty-three cards several could
         be. */
      onMouseLeave={close}
    >
      {/* Centred, because a pie has no left edge to align to the way the bar
          did — set flush left in a card this wide it read as an ornament
          beside the legend rather than the figure the legend keys. */}
      <div className="flex justify-center">
        <OptionPie
          options={slices.map((slice) => slice.label)}
          counts={slices.map((slice) => slice.names.length)}
          colors={slices.map((slice) => slice.color)}
          onSegmentEnter={(i) => graze(slices[i].key)}
          onSegmentLeave={() => graze(null)}
          /* -1 from findIndex is "no option", which the pie spells null. */
          highlight={highlight < 0 ? null : highlight}
          size={PIE}
          label={question}
        />
      </div>

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
      {shown && <Names slice={shown} onDismiss={close} />}
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

/* Who gave this answer, set just below the pie.
 *
 * Over the card rather than in the flow of it: a panel that pushed the legend
 * down would move the rows out from under the reader as it opened, and shift
 * every card beneath it on the page.
 *
 * The top offset is the pie's own height and the gap under it, so the panel
 * meets the bottom of the chart whichever option opened it.
 *
 * IT LEADS WITH THE ANSWER
 *   The panel used to open on a count — "38 candidates" — and nothing else.
 *   Which thirty-eight, of the three or four splits on the card, was a fact
 *   the reader had to hold from the row they clicked, and on a pie they may
 *   have come from a slice rather than a row: a wedge of colour carries no
 *   wording at all. So the wording the candidates were shown is the first
 *   thing in the panel, set the way the legend sets it and dotted in the
 *   slice's own colour, and the count sits under it as the caption it is.
 *
 * IT IS AS TALL AS IT CAN BE
 *   The cap was fourteen rem, which held about ten names of a slice that on
 *   the city-wide page runs to fifty-five: the rest were behind a scrollbar
 *   inside an overlay, which is a place readers do not look. The panel now
 *   takes the height it needs up to forty-six rem — what fifty-five names
 *   come to in two columns, with the heading over them — and stops there or
 *   at three-quarters of the window, whichever comes first, so it can never
 *   run off the screen it opened on.
 *
 *   It can and does run over the cards below, which stay laid out as though
 *   nothing were there. That is what an overlay is, and it is why the figure
 *   lifts to `z-30` while a panel is open: what the reader sees is a popover
 *   above the page, held open only as long as the pointer stays in the figure.
 *
 *   The heading is outside the scroller rather than sticky inside it, so the
 *   answer stays put while fifty names move under it.
 *
 * Names as plain text, not as the bordered plates the ward pages use. A plate
 * is an object a reader counts in a field of four or five; fifty of them in a
 * panel is a mosaic, and the count is already at the top of the panel. */
function Names({ slice, onDismiss }: { slice: SplitSlice; onDismiss: () => void }) {
  return (
    <div
      className="absolute inset-x-0 z-20 flex max-h-[min(75vh,46rem)] flex-col border border-dark bg-bg shadow-[0_6px_20px_rgba(0,0,0,0.1)]"
      style={{ top: `calc(${PIE}px + 0.75rem)` }}
      /* The legend row that would let a latched panel go is underneath this,
         so the panel itself is the way out. Harmless on a panel opened by
         hover, which the pointer never reaches. */
      onClick={onDismiss}
    >
      <div className="flex-none border-b border-border-light p-3">
        <p className="grid grid-cols-[auto_1fr] items-baseline gap-x-2.5 font-serif text-[1.05rem] font-medium leading-[1.3] tracking-[-0.015em] text-dark text-pretty">
          <span
            className="size-2.5 translate-y-[0.25em] rounded-full"
            style={{ background: slice.color }}
            aria-hidden="true"
          />
          {slice.label}
        </p>
        <p className="type-label-sm mt-1.5 pl-[1.25rem] text-text-muted">
          {slice.names.length === 1
            ? "1 candidate"
            : `${slice.names.length} candidates`}
        </p>
      </div>

      {/* A grid, not CSS columns. A segment can hold fifty people and the
          panel is capped, and multi-column laid out inside a capped box does
          not grow downwards — it fragments sideways, opening a fourth and
          fifth column past the panel's right edge. So the overflow ran
          horizontally while the scrolling was vertical, and the names in those
          columns could not be reached at all. A grid fills rows downwards,
          which is the direction this box scrolls.

          How many columns is a question about the panel's width and not the
          window's: these cards sit two and three to a row on a wide screen, so
          the panel is around four hundred pixels there and a viewport-keyed
          third column would have squeezed every name onto two lines. Hence the
          container query on the figure.

          Set small. A name here is a thing the reader scans for rather than
          reads — they are looking for one they know, or counting how many of a
          slice they recognise — and fifty of them is a block that has to sit
          under the chart without becoming the card. */}
      <ul className="grid min-h-0 grid-cols-1 gap-x-4 gap-y-1 overflow-y-auto list-none m-0 p-3 @xs:grid-cols-2 @2xl:grid-cols-3">
        {slice.names.map((candidate) => (
          <li
            key={candidate.key}
            className="font-sans text-[0.84rem] leading-[1.35] text-dark"
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
