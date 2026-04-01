import { stripNulls } from "../utils";
import { generatePersonSchema, type PersonData } from "./person";

interface SiteConfigData {
  orgName: string;
  siteUrl: string;
}

interface TestimonialData {
  name: string;
  quote: string;
  title?: string | null;
  profilePhoto?: string | null;
  person?: PersonData | null;
}

export function generateReviewSchema(
  testimonial: TestimonialData,
  config: SiteConfigData
) {
  const author = testimonial.person
    ? generatePersonSchema(testimonial.person)
    : stripNulls({
        "@type": "Person" as const,
        name: testimonial.name,
        jobTitle: testimonial.title,
        image: testimonial.profilePhoto,
      });

  return {
    "@type": "Review" as const,
    author,
    reviewBody: testimonial.quote,
    itemReviewed: {
      "@type": "Organization" as const,
      name: config.orgName,
      url: config.siteUrl,
    },
  };
}
