export interface YFPagination {
  page: number;
  pages: number;
  count: number;
  per_page: number;
}

export interface YFPaginatedResponse<T> {
  data: T[];
  pagination: YFPagination;
}

export interface YFListResponse<T> {
  data: T[];
}

export interface YFAuthor {
  id: number;
  name: string;
  slug: string;
  profile_photo_url?: string | null;
}

export interface YFPollPublication {
  survey_slug: string;
  survey_campaign_id: string | null;
  pollster: string | null;
  sample_size: number | null;
  fieldwork_start: string | null;
  fieldwork_end: string | null;
  methodology: string;
  methodology_markdown: string | null;
  news_release: string;
  news_release_markdown: string | null;
  downloads: Partial<Record<"analysis_markdown" | "analysis_pdf" | "crosstabs_pdf" | "crosstabs_json", string>>;
}

export interface YFMemo {
  content_kind?: "memo" | "poll";
  id: number;
  slug: string;
  title: string;
  category: string | null;
  featured: boolean;
  published_at: string | null;
  seo_image_url: string | null;
  banner_image_url: string | null;
  author: YFAuthor;
}

export interface YFMemoEndorser {
  name: string;
  created_at: string;
}

export interface YFMemoCritique {
  id: number;
  name: string;
  body: string;
  created_at: string;
}

export interface YFMemoDetail extends YFMemo {
  body_markdown?: string | null;
  appendix_markdown?: string | null;
  supporters_markdown?: string | null;
  poll?: YFPollPublication;
  body: string;
  appendix: string | null;
  supporters: string | null;
  key_messages: string[];
  twitter_embed: string | null;
  author_name: string | null;
  author_title: string | null;
  co_author: YFAuthor | null;
  endorsements_count: number;
  critiques_count: number;
  recent_endorsers: YFMemoEndorser[];
  critiques: YFMemoCritique[];
}

export interface YFTeamMember {
  id: number;
  name: string;
  slug: string;
  title: string | null;
  role: "board" | "team" | "volunteer" | "advisor" | "memo_author";
  twitter_url: string | null;
  linkedin_url: string | null;
  position: number;
  profile_photo_url: string | null;
}

export interface YFTestimonial {
  id: number;
  name: string;
  quote: string;
  position: number;
  profile_photo_url: string | null;
  splash_photo_url: string | null;
}

export interface YFFaq {
  id: number;
  question: string;
  answer: string;
  answer_text: string | null;
  link_text: string | null;
  link_href: string | null;
  position: number;
}

export interface YFPost {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  published_at: string | null;
  seo_image_url: string | null;
  banner_image_url: string | null;
}

export interface YFPostDetail extends YFPost {
  body: string | null;
  body_markdown: string | null;
}

export interface YFFeedItem {
  id: number;
  feedable_type: string;
  item_type: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  author: string | null;
  account_handle: string | null;
  url: string | null;
  slug: string | null;
  featured: boolean;
  tags: string[];
  image_url: string | null;
  author_photo_url: string | null;
  published_at: string;
}

export interface YFFeedItemDetail extends YFFeedItem {
  body: string | null;
  embed_code: string | null;
  author_photo_url: string | null;
}
