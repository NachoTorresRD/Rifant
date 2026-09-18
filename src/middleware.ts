import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE_NAME = 'rifant_admin_token';
const TOKEN_VALUE = 'authenticated_rifant_admin_session_valid';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isAuthorized = adminToken === TOKEN_VALUE;

    if (!isAuthorized) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect all /api/admin routes except /api/admin/login
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
    const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isAuthorized = adminToken === TOKEN_VALUE;

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: 'Acceso no autorizado. Se requiere iniciar sesión como administrador.',
        },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
