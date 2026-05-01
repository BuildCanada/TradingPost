import { draftMode, cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { PREVIEW_TOKEN_COOKIE } from "@/lib/api/preview";

export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();

  const cookieStore = await cookies();
  cookieStore.delete(PREVIEW_TOKEN_COOKIE);

  const slug = new URL(request.url).searchParams.get("slug");
  redirect(slug && slug.startsWith("/") && !slug.startsWith("//") ? slug : "/");
}
