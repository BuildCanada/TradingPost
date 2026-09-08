import type { Metadata } from "next";
import PollInformationPage from "../PollInformationPage";

export const metadata: Metadata = {
  title: "Polling Methodology",
  description: "How Build Canada polls: random mobile sampling, census weighting, transparent reporting, and privacy by design.",
  alternates: { canonical: "/polls/methodology" },
};

export default function MethodologyPage() {
  return <PollInformationPage title="How We Poll">{`
## Real Canadians, reached at random

Many online polls rely on panels – people who signed up to take surveys for rewards. We don't use panels. We generate mobile phone numbers at random and send a single text message inviting people to share their views, so every Canadian with a cell phone has a chance of being heard, not just those who joined a list. National polls are fielded in both English and French.

## Nobody is paid to have opinions

We offer no rewards, points, or prize draws. People answer because they want to be heard. That costs us responses and removes an entire category of professional-survey-taker bias that panel polls have to fight.

## Weighted to look like Canada

Raw responses never perfectly mirror the country, so every poll is weighted to Statistics Canada census benchmarks (age, gender, region, and education) so the final sample reflects Canada as it actually is. Geography comes from where respondents tell us they live, never from their area code.

## Honest about the limits

No survey method is perfect, including ours. Our approach reaches mobile phones only, so Canadians without one are outside our sample, and weighting can't fully repair that. We report a margin of error with every poll adjusted for the effect of weighting, and we explain what it does and doesn't capture. When two numbers are within the margin of error, we say the race is a coin flip, not a lead.

## Transparent for every survey we run

Every poll release includes the field dates, the number of respondents, the full question wording in the order it was asked, how the data was weighted, and complete data tables. We always disclose who paid for the research, including when it's us.

## Held to industry standards

Build Canada is a member of the Canadian Research Insights Council (CRIC) and adheres to its Public Opinion Research Standards and Disclosure Requirements, the Canadian research industry's rules for how credible polls are conducted and reported. We register every public poll with CRIC's Research Verification Service.

## When we get it wrong

If an error is found in our data or analysis, we correct it publicly and note the correction on the affected release. Methodology questions and challenges from researchers, journalists, and the public go to [polling@buildcanada.com](mailto:polling@buildcanada.com) and get answered.

## Private by design

Results are reported only in aggregate. We never publish, sell, or share anyone's phone number or individual answers. Replying STOP (or ARRET) removes a number from all future contact, permanently. See our [Privacy Policy](/polls/privacy-policy) for details.

## Work with us

Have questions you want answered by a representative sample of Canadians? Commission questions on a Build Canada omnibus poll: rigorous sampling, census weighting, full cross-tabs, and a written summary. Reach out at: [polling@buildcanada.com](mailto:polling@buildcanada.com)
`}</PollInformationPage>;
}
