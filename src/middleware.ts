// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'cbc-insight-ai-super-secret-development-key-2026-replace-in-prod'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the user is trying to access a protected dashboard route
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth_token')?.value;

    // No token found -> Kick them to the login page
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify the cryptographic signature of the session token
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      // Token is expired, tampered with, or corrupt -> Clear cookie and redirect
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // If a logged-in user tries to visit login/register, send them to the dashboard
  if (pathname === '/login' || pathname === '/register') {
    const token = request.cookies.get('auth_token')?.value;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch {
        // Token invalid, let them stay on login page
      }
    }
  }

  return NextResponse.next();
}

// Ensure middleware only executes on relevant UI and API paths
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};