export type SubscribeSource = "inline" | "navbar" | "exit-intent";

export interface SubscribeCopy {
  headline: string;
  body: string;
  placeholder: string;
  buttonLabel: string;
  trustLine: string;
}

export const subscribeCopy: Record<SubscribeSource, SubscribeCopy> = {
  inline: {
    headline: "Get the memos",
    body: "Policy research from Canada\u2019s top builders \u2014 delivered to your inbox.",
    placeholder: "you@company.com",
    buttonLabel: "Get the memos",
    trustLine: "No spam. Unsubscribe anytime.",
  },
  navbar: {
    headline: "Get the memos",
    body: "Policy research from Canada\u2019s top builders, delivered to your inbox.",
    placeholder: "you@company.com",
    buttonLabel: "Get the memos",
    trustLine: "No spam. Unsubscribe anytime.",
  },
  "exit-intent": {
    headline: "Before you go",
    body: "We publish policy research from Canada\u2019s top builders \u2014 the kind that actually gets enacted. Join the readers who see it first.",
    placeholder: "you@company.com",
    buttonLabel: "Send me the next memo",
    trustLine: "No spam. Unsubscribe anytime.",
  },
};

export const successCopy = {
  heading: "Good call.",
  body: "You\u2019re in. We\u2019ll send policy research from Canada\u2019s top builders straight to your inbox \u2014 the kind that actually gets enacted.",
  secondaryCtaPre: "While you\u2019re here \u2014",
  secondaryCtaLabel: "Read the latest memo",
  secondaryCtaHref: "/memos",
};
