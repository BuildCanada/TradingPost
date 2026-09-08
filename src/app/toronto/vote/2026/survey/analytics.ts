"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import posthog from "posthog-js";

import { DEFAULT_ELECTION_SLUG } from "@/lib/elections/registry";
import type { Survey } from "@/lib/elections/survey";

import type { SurveySubmission } from "./submitSurvey";

/**
 * PostHog instrumentation for the voter survey, kept in one place so every
 * event carries the same identifying properties — which survey, which version,
 * which election. A funnel built on these is only as good as that consistency:
 * a step event missing `survey_version` silently pools answers to two different
 * question sets into one drop-off number.
 *
 * The two questions this is meant to answer:
 *
 *   completion — `survey_viewed` → `survey_started` → `survey_submitted`
 *   drop-off   — `survey_step_completed`, filtered to `step_index` 0, 1, 2 …
 *                as successive funnel steps
 *
 * `survey_step_completed` fires once per step actually cleared, so the funnel
 * reads as "reached the end of step n" rather than "was shown step n". A
 * respondent who lands on step 3 and leaves without answering never emits it,
 * which is the drop we want counted.
 */

/** Where someone is in the questionnaire when an event fires. */
export type SurveyProgress = {
  /** zero-based, so PostHog funnel steps line up with the array */
  stepIndex: number;
  stepId: string;
  stepTitle: string;
  /** questions on this step that have a non-empty answer */
  answeredOnStep: number;
  questionsOnStep: number;
  /** answered across the whole survey so far */
  answeredTotal: number;
};

function progressProps(progress: SurveyProgress) {
  return {
    step_index: progress.stepIndex,
    // Step number as a human reads it — the funnel is filtered on step_index,
    // but a breakdown table is unreadable without this.
    step_number: progress.stepIndex + 1,
    step_id: progress.stepId,
    step_title: progress.stepTitle,
    answered_on_step: progress.answeredOnStep,
    questions_on_step: progress.questionsOnStep,
    answered_total: progress.answeredTotal,
  };
}

export type SurveyAnalytics = {
  /** First answer touched. Fires once; later calls are ignored. */
  started: (progress: SurveyProgress) => void;
  /** A step validated and the respondent moved on. */
  stepCompleted: (progress: SurveyProgress) => void;
  /** Validation held them on the step. `fields` are the question ids at fault. */
  stepBlocked: (progress: SurveyProgress, fields: string[]) => void;
  stepBack: (progress: SurveyProgress) => void;
  submitted: (progress: SurveyProgress, submission: SurveySubmission) => void;
  submitFailed: (progress: SurveyProgress) => void;
  /** The comparison view rendered — or didn't, for want of a ward or answers. */
  resultsViewed: (props: {
    hasComparison: boolean;
    ward: string | null;
    races: string[];
  }) => void;
};

export function useSurveyAnalytics(survey: Survey): SurveyAnalytics {
  const base = useMemo(
    () => ({
      survey: survey.slug,
      survey_version: survey.version,
      election: DEFAULT_ELECTION_SLUG,
      step_count: survey.steps.length,
    }),
    [survey],
  );

  // Wall-clock from the moment the questionnaire was rendered. Reported in
  // seconds because nothing here is measured finely enough to justify ms.
  // Stamped in the mount effect rather than here: reading the clock during
  // render is impure, and the survey isn't on screen until the effect runs.
  const openedAt = useRef(0);
  const hasStarted = useRef(false);
  /** Set once the run is accounted for — submitted, or already reported as
   *  abandoned — so the unload handler can't file a second ending for it. */
  const settled = useRef(false);
  /** Latest progress, read by the unload handler, which has no other way to
   *  know where they got to. */
  const latest = useRef<SurveyProgress | null>(null);

  const secondsElapsed = () =>
    openedAt.current === 0
      ? 0
      : Math.round((Date.now() - openedAt.current) / 1000);

  const capture = useCallback(
    (event: string, props: Record<string, unknown> = {}) => {
      posthog.capture(event, {
        ...base,
        seconds_elapsed: secondsElapsed(),
        ...props,
      });
    },
    [base],
  );

  // Top of the funnel. Page views are autocaptured, but a view of *this*
  // survey at *this* version is not something a URL alone says, and the
  // completion rate is measured against it.
  useEffect(() => {
    openedAt.current = Date.now();
    posthog.capture("survey_viewed", base);
  }, [base]);

  // The drop itself. A respondent who leaves mid-survey never sends anything
  // else, so this is the only event that says how far they got before going.
  // sendBeacon because the page is on its way out; visibilitychange as well as
  // pagehide, since a backgrounded mobile tab may never unload.
  //
  // That makes it a best-effort last-seen marker rather than a verdict:
  // someone who switches tabs and comes back to finish emits this *and*
  // `survey_submitted`. Read completion from `survey_submitted` and drop-off
  // from the absence of the next `survey_step_completed` — not from a count of
  // these. At most one is sent per run, so it can't inflate on tab-switching.
  useEffect(() => {
    const report = () => {
      if (settled.current || !hasStarted.current) return;
      settled.current = true;
      const progress = latest.current;
      posthog.capture(
        "survey_abandoned",
        {
          ...base,
          seconds_elapsed: secondsElapsed(),
          ...(progress ? progressProps(progress) : {}),
        },
        { transport: "sendBeacon" },
      );
    };

    const onHide = () => {
      if (document.visibilityState === "hidden") report();
    };

    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", report);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", report);
    };
  }, [base]);

  return useMemo<SurveyAnalytics>(
    () => ({
      started(progress) {
        latest.current = progress;
        if (hasStarted.current) return;
        hasStarted.current = true;
        capture("survey_started", progressProps(progress));
      },
      stepCompleted(progress) {
        latest.current = progress;
        capture("survey_step_completed", progressProps(progress));
      },
      stepBlocked(progress, fields) {
        latest.current = progress;
        capture("survey_step_blocked", {
          ...progressProps(progress),
          fields,
          field_count: fields.length,
        });
      },
      stepBack(progress) {
        latest.current = progress;
        capture("survey_step_back", progressProps(progress));
      },
      submitted(progress, submission) {
        latest.current = progress;
        settled.current = true;
        capture("survey_submitted", {
          ...progressProps(progress),
          ward: submission.derivedRegion ?? submission.region ?? null,
        });
      },
      submitFailed(progress) {
        latest.current = progress;
        capture("survey_submit_failed", progressProps(progress));
      },
      resultsViewed({ hasComparison, ward, races }) {
        // Completing and being shown a comparison are different outcomes: a
        // ward whose candidates haven't answered gets a thank-you and nothing
        // to read, and that is worth being able to count.
        capture("survey_results_viewed", {
          has_comparison: hasComparison,
          ward,
          races,
        });
      },
    }),
    [capture],
  );
}
