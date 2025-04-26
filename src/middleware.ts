import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

// Paths that don't require authentication
const publicPaths = ['/', '/login', '/api/auth/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Middleware processing path:', pathname);
  
  // Allow public paths
  if (publicPaths.includes(pathname)) {
    console.log('Allowing public path:', pathname);
    return NextResponse.next();
  }
  
  // Check for API routes
  if (pathname.startsWith('/api/')) {
    // Allow auth-related API routes
    if (pathname.startsWith('/api/auth/')) {
      console.log('Allowing auth API route:', pathname);
      return NextResponse.next();
    }
    
    // For other API routes, check authentication
    const token = request.cookies.get('session')?.value;
    console.log('API route - Session token present:', !!token);
    
    if (!token) {
      console.log('No session token found for API route');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const session = await getSession(token);
    console.log('API route - Valid session:', !!session);
    
    if (!session) {
      console.log('Invalid session for API route');
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }
    
    return NextResponse.next();
  }
  
  // For page routes, redirect to login if not authenticated
  const token = request.cookies.get('session')?.value;
  console.log('Page route - Session token present:', !!token);
  
  if (!token) {
    console.log('No session token found, redirecting to login');
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  
  const session = await getSession(token);
  console.log('Page route - Valid session:', !!session);
  
  if (!session) {
    console.log('Invalid session, redirecting to login');
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  
  // If user is authenticated and trying to access the home page, redirect to dashboard
  if (pathname === '/' && token && session) {
    console.log('Authenticated user accessing home, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  console.log('Allowing access to protected route:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
  runtime: 'nodejs'
}; 