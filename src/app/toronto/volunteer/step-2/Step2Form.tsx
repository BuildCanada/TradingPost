"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AVAILABILITY_OPTIONS,
  DETAILS_API_PATH,
  MAYORAL_OPTIONS,
  THANKS_PATH,
} from "../build-the-vote";
import { inputClass, labelClass } from "../VolunteerSignupForm";

const optionClass =
  "flex items-center gap-2.5 font-serif text-[1.05rem] cursor-pointer";

/**
 * Step 2: optional details for the volunteer's coordinator, added to their row
 * in CJPAC's Sheet. The API finds the row from a cookie step 1 set, so this
 * form never needs the email. If that cookie has expired the sign-up itself
 * is already saved, so the volunteer goes on to the thanks page regardless.
 */
export function Step2Form() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);

    setLoading(true);
    try {
      const res = await fetch(DETAILS_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availability: data.getAll("availability"),
          mayoral: data.get("mayoral") ?? "",
          issues: data.get("issues") ?? "",
        }),
      });
      if (!res.ok && res.status !== 401) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      router.push(`${THANKS_PATH}/`);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">
      <p className="font-serif text-[1.05rem] leading-[1.5] text-text-secondary">
        All questions are optional.
      </p>
      <fieldset>
        <legend className={labelClass}>
          What is your availability to volunteer on October&nbsp;26?
        </legend>
        <div className="flex flex-col gap-2.5 mt-1">
          {AVAILABILITY_OPTIONS.map((option) => (
            <label key={option} className={optionClass}>
              <input
                type="checkbox"
                name="availability"
                value={option}
                className="size-4 accent-accent"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className={labelClass}>
          Which mayoral candidate best aligns with your values and priorities?
        </legend>
        <div className="flex flex-col gap-2.5 mt-1">
          {MAYORAL_OPTIONS.map((option) => (
            <label key={option} className={optionClass}>
              <input
                type="radio"
                name="mayoral"
                value={option}
                className="size-4 accent-accent"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        <span className={labelClass}>
          In these municipal elections, what issues are most important to you?
        </span>
        <textarea
          name="issues"
          rows={4}
          maxLength={2000}
          className={`${inputClass} resize-y`}
        />
      </label>
      <div>
        <Button
          as="button"
          type="submit"
          variant="auburn"
          disabled={loading}
          className="px-7 py-4.5"
        >
          {loading ? "Saving…" : "Finish"}
        </Button>
        <p role="alert" className="type-label-sm text-auburn-800 mt-3 min-h-[1.3em]">
          {error}
        </p>
      </div>
    </form>
  );
}
