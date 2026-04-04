"use client";

import { Button } from "@/components/ui/button";

export default function SubscribeForm() {
  return (
    <div id="subscribe" className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px]">
      <div className="max-w-[1080px] mx-auto">
      <span className="type-label font-bold text-text-secondary block pb-1">
        Subscribe
      </span>
      <p className="type-body mb-4 mt-1">
        Stay informed on bold ideas for Canada.
      </p>
      <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="First Name"
            className="border border-border-light bg-white px-3 py-2.5 type-body placeholder:text-text-muted outline-none focus:border-dark transition-colors"
          />
          <input
            type="text"
            placeholder="Last Name"
            className="border border-border-light bg-white px-3 py-2.5 type-body placeholder:text-text-muted outline-none focus:border-dark transition-colors"
          />
        </div>
        <input
          type="email"
          placeholder="Email"
          className="border border-border-light bg-white px-3 py-2.5 type-body placeholder:text-text-muted outline-none focus:border-dark transition-colors"
        />
        <input
          type="text"
          placeholder="Postal Code"
          pattern="[A-Za-z0-9]{5,6}"
          maxLength={6}
          className="border border-border-light bg-white px-3 py-2.5 type-body placeholder:text-text-muted outline-none focus:border-dark transition-colors"
        />
        <Button as="button" type="submit" className="self-start">
          Subscribe
        </Button>
      </form>
      </div>
    </div>
  );
}
