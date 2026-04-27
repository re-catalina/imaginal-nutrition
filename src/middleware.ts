import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/nemo/:path*",
    "/plan/:path*",
    "/log/:path*",
    "/grocery/:path*",
    "/recipes/:path*",
    "/settings/:path*",
    "/setup",
    "/setup/:path*"
  ]
};
