import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Protect dashboard and admin routes
  const isDashboardRoute = path.startsWith('/dashboard');
  const isAdminRoute = path.startsWith('/admin');
  
  // For a fast-launch zero-error approach, we rely on a lightweight cookie check
  // (In production, the client sets this cookie upon successful Firebase Auth)
  const token = request.cookies.get('bhulia-auth-token')?.value;

  if (isDashboardRoute || isAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Handle Reseller Subdomains (tenant routing)
  const hostname = request.headers.get('host') || '';
  const isCustomSubdomain = hostname !== 'bhulia.com' && hostname !== 'www.bhulia.com' && hostname !== 'localhost:3000' && !hostname.includes('vercel.app');
  
  if (isCustomSubdomain && path === '/') {
    // Extract subdomain (e.g., storename.bhulia.com -> storename)
    const subdomain = hostname.split('.')[0];
    // Rewrite to the storefront page
    return NextResponse.rewrite(new URL(`/store/${subdomain}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
