import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ELECTION } from "../../vote/2026/key-dates";
import { FormstackForm } from "../FormstackForm";
import { SignupTracker } from "../SignupTracker";
import {
  CJPAC_URL,
  EMAIL_COOKIE,
  STEP_2,
  THANKS_PATH,
} from "../build-the-vote";

export const metadata: Metadata = {
  title: "A few more questions",
  robots: { index: false, follow: false },
};

export default async function VolunteerStep2Page() {
  // Put here by src/proxy.ts, which took it off the URL step 1 redirected to.
  const email = (await cookies()).get(EMAIL_COOKIE)?.value ?? "";

  return (
    <div className={`${ELECTION.themeClass ?? ""} bg-bg text-dark`}>
      <SignupTracker />
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
        <section className="grid lg:grid-cols-[1fr_1.2fr]">
          <div className="px-6 py-12 md:px-14 md:py-16 border-b lg:border-b-0 lg:border-r border-border-light">
            <div className="flex gap-1.5 max-w-[180px] mb-6" aria-hidden="true">
              <span className="h-1 flex-1 bg-accent" />
              <span className="h-1 flex-1 bg-border-light" />
            </div>
            <p className="type-label text-accent mb-3.5">Step 2 of 2</p>
            <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(2.2rem,5vw,3.75rem)] max-w-[14ch] text-balance mb-6">
              You&rsquo;re signed up. Thank you.
            </h1>
            <p className="font-serif text-[1.15rem] leading-[1.5] max-w-[42ch]">
              Three quick questions help your coordinator find the right race
              for you. It takes under a minute.
            </p>
          </div>
          <div className="px-6 py-12 md:px-14 md:py-16">
            <FormstackForm
              slug={STEP_2.slug}
              fill={{ [STEP_2.fields.email]: email }}
            />
            <p className="font-serif text-[1rem] leading-[1.5] text-text-secondary mt-6 max-w-[56ch]">
              Sign-ups are handled by our volunteer partner,{" "}
              <a
                href={CJPAC_URL}
                className="underline underline-offset-2 hover:text-accent"
                target="_blank"
                rel="noopener noreferrer"
              >
                CJPAC
              </a>
              , a non-partisan organization that coordinates Election Day
              volunteers.
            </p>
            <Link
              href={THANKS_PATH}
              className="inline-block mt-5 type-label text-text-secondary underline underline-offset-2 hover:text-accent"
            >
              Skip this step
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
