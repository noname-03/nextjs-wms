import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from cookies
  const token = request.cookies.get('auth_token')?.value;

  console.log('🔒 Middleware check:', {
    path: pathname,
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
  });

  // Public paths that don't require authentication
  const publicPaths = ['/login'];
  const isPublicPath = publicPaths.includes(pathname);

  // If trying to access dashboard routes without token, redirect to login
  if (pathname.startsWith('/dashboard') && !token) {
    console.log('🚫 Middleware: No token for dashboard, redirecting to /login');
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (isPublicPath && token && pathname === '/login') {
    console.log('🔄 Middleware: Has token at login, redirecting to /dashboard');
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  console.log('✅ Middleware: Allowing access to', pathname);
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
     * - / (root path - let it handle routing)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|$).*)',
  ],
};