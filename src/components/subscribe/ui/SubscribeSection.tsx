"use client";

import { useSubscribeStore } from "../store";
import { SubscribeForm } from "./SubscribeForm";
import { SubscribeSuccess } from "./SubscribeSuccess";

export function SubscribeSection() {
  const subscribed = useSubscribeStore((s) => s.subscribed);

  return (
    <div
      id="subscribe"
      className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px]"
    >
      <div className="max-w-[1080px] mx-auto">
        {subscribed ? (
          <SubscribeSuccess />
        ) : (
          <>
            <span className="type-label font-bold text-charcoal-600 block pb-1">
              Subscribe
            </span>
            <p className="type-body mb-4 mt-1">
              Stay informed on bold ideas for Canada.
            </p>
            <SubscribeForm source="inline" />
          </>
        )}
      </div>
    </div>
  );
}
