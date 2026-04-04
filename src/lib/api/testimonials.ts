import { apiFetch } from "./client";
import type { YFTestimonial, YFListResponse } from "./types";

interface TestimonialSerialized {
  id: string;
  name: string;
  quote: string;
  title: string | null;
  companyLogo: string | null;
  profilePhoto: string | null;
  splashPhoto: string | null;
  order: number;
  person: null;
}

function mapTestimonial(t: YFTestimonial): TestimonialSerialized {
  return {
    id: String(t.id),
    name: t.name,
    quote: t.quote,
    title: null,
    companyLogo: null,
    profilePhoto: t.profile_photo_url,
    splashPhoto: t.splash_photo_url,
    order: t.position,
    person: null,
  };
}

export async function fetchTestimonials(): Promise<TestimonialSerialized[]> {
  const res = await apiFetch<YFListResponse<YFTestimonial>>("/testimonials", {
    revalidate: 3600,
  });
  return res.data.map(mapTestimonial);
}
