import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware for Next.js application to protect routes
 * This runs before the request is completed
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/api/auth',
    '/search',
    '/listings',
  ];
  
  // Check if the path starts with any of the public paths
  const isPublicPath = publicPaths.some(path => 
    pathname === path || 
    pathname.startsWith(`${path}/`) ||
    pathname.startsWith('/api/auth/')
  );
  
  // Allow public assets
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/images') || 
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }
  
  // Allow public paths
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Get the token
  const token = await getToken({ req: request });
  
  // If no token and trying to access protected route, redirect to login
  if (!token) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // Admin-only paths
  const adminPaths = [
    '/admin',
  ];
  
  // Check if the path starts with any of the admin paths
  const isAdminPath = adminPaths.some(path => 
    pathname === path || 
    pathname.startsWith(`${path}/`)
  );
  
  // If trying to access admin path but not an admin, redirect to home
  if (isAdminPath && !token.roles?.includes('admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Seller-only paths
  const sellerPaths = [
    '/seller-dashboard',
  ];
  
  // Check if the path starts with any of the seller paths
  const isSellerPath = sellerPaths.some(path => 
    pathname === path || 
    pathname.startsWith(`${path}/`)
  );
  
  // If trying to access seller path but not a seller or admin, redirect to home
  if (isSellerPath && 
      !token.roles?.includes('seller') && 
      !token.roles?.includes('admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // User-specific paths that require ownership verification
  if (pathname.startsWith('/profile/') && 
      !pathname.startsWith(`/profile/${token.sub}`) && 
      !token.roles?.includes('admin')) {
    // Allow viewing other profiles, but not editing them
    if (request.method !== 'GET') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  // Allow the request to proceed
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next (Next.js internals)
     * 2. /api/auth (NextAuth.js endpoints)
     * 3. /images (public files)
     * 4. /favicon.ico (favicon file)
     */
    '/((?!_next|images|favicon.ico).*)',
  ],
};
