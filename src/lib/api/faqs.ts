import { apiFetch } from "./client";
import type { YFFaq, YFListResponse } from "./types";

interface FaqSerialized {
  id: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

function mapFaq(f: YFFaq): FaqSerialized {
  return {
    id: String(f.id),
    question: f.question,
    answer: f.answer,
    order: f.position,
    active: true,
  };
}

export async function fetchFaqs(): Promise<FaqSerialized[]> {
  const res = await apiFetch<YFListResponse<YFFaq>>("/faqs", {
    revalidate: 3600,
  });
  return res.data.map(mapFaq);
}
