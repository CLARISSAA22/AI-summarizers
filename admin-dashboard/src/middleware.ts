
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value;

    const { pathname } = request.nextUrl;

    // 1. Redirect if trying to access dashboard without session
    if (pathname.startsWith('/dashboard')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Verify session
        try {
            const payload = await decrypt(session);

            // 2. Role-based protection
            if (pathname.startsWith('/dashboard/admin') && payload.user.role !== 'admin') {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        } catch (error) {
            // Invalid session
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // 3. Redirect if already logged in and trying to access auth pages
    if ((pathname === '/login' || pathname === '/register') && session) {
        try {
            await decrypt(session);
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } catch (error) {
            // Session invalid, allow access to login
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register'],
};
