import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const publicApiRoutes = ["/api/auth", "/api/projects", "/api/team", "/api/testimonials", "/api/memos", "/api/feed"];
  const isPublicApi = publicApiRoutes.some((route) => pathname.startsWith(route)) && req.method === "GET";
  const isAdminApi = pathname.startsWith("/api/") && !isPublicApi && !pathname.startsWith("/api/auth");
  const isLoginPage = pathname === "/admin/login";

  // Allow the login page always
  if (isLoginPage) return;

  // Protect admin pages and API routes
  if ((isAdminRoute || isAdminApi) && !isLoggedIn) {
    if (isAdminApi) {
      return new Response("Unauthorized", { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
