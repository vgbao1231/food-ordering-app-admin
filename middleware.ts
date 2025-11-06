import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = Boolean(request.cookies.get('accessToken')?.value);
  const { pathname } = request.nextUrl;

  // Nếu là trang admin/* mà chưa login thì redirect
  if (pathname.startsWith('/admin') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/login') && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin/stores', request.url));
  }

  return NextResponse.next();
}

// Chỉ áp dụng middleware cho route admin/*
export const config = {
  matcher: ['/admin/:path*', '/login'],
};
