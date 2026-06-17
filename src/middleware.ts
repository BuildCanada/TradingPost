import type { NextRequest } from "next/server";
import { proxy } from "./proxy";

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};

export async function middleware(req: NextRequest) {
  return proxy(req);
}
