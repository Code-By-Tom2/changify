import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const ADMIN_EMAIL = "admin@changify.com"; // Replace with your admin email

export default withAuth(
  function middleware(req) {
    // Get the pathname
    const path = req.nextUrl.pathname;
    
    // Get user's role from token
    const token = req.nextauth.token;
    const isAdmin = token?.email === ADMIN_EMAIL;
    const isNGO = token?.role === "ngo";
    const isVerifiedNGO = token?.isVerified === true;

    // Public routes that should be accessible without authentication
    const publicRoutes = [
      "/ngo/login",
      "/ngo/register",
      "/ngo/forgot-password",
      "/ngo/reset-password",
      "/admin/login"
    ];
    
    // If the route is public, allow access
    if (publicRoutes.includes(path)) {
      return NextResponse.next();
    }

    // If trying to access admin routes but not an admin
    if (path.startsWith("/admin") && !isAdmin) {
      console.log("Non-admin user attempting to access admin route:", token?.email);
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // If trying to access NGO routes but not an NGO
    if (path.startsWith("/ngo") && !isNGO) {
      console.log("Non-NGO user attempting to access NGO route:", token?.email);
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Allow verified NGOs to access all NGO routes
    if (path.startsWith("/ngo") && isVerifiedNGO) {
      return NextResponse.next();
    }

    // For unverified NGOs, only allow access to verification page
    if (path.startsWith("/ngo") && !isVerifiedNGO && path !== "/ngo/verification") {
      console.log("Unverified NGO attempting to access restricted route:", token?.email);
      return NextResponse.redirect(new URL("/ngo/verification", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes without authentication
        const path = req.nextUrl.pathname;
        const publicRoutes = [
          "/ngo/login",
          "/ngo/register",
          "/ngo/forgot-password",
          "/ngo/reset-password",
          "/admin/login"
        ];
        if (publicRoutes.includes(path)) {
          return true;
        }
        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/ngo/:path*"
  ]
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Only run middleware on admin routes
  if (path.startsWith("/admin") && path !== "/admin/login") {
    // Check for admin authentication
    const adminAuth = request.cookies.get("adminAuth")?.value;

    if (!adminAuth) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const configAdmin = {
  matcher: ["/admin/:path*"],
}; 