import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the token from cookies
  const token = request.cookies.get('auth_token')?.value;
  
  console.log('🔒 Middleware - Path:', pathname, 'Token exists:', !!token);
  
  // Public paths that don't require authentication
  const publicPaths = ['/login'];
  const isPublicPath = publicPaths.includes(pathname);
  
  // If trying to access dashboard routes without token, redirect to login
  if (pathname.startsWith('/dashboard') && !token) {
    console.log('🚫 No token, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If logged in and trying to access login page, redirect to dashboard
  if (isPublicPath && token && pathname === '/login') {
    console.log('🔄 Already logged in, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
     * - / (root path - let it handle routing)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|$).*)',
  ],
};