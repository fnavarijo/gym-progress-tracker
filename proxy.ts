import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { routing } from './i18n/routing';
import { hasEnvVars } from '@/lib/utils';

const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  // Step 1: Run next-intl routing (handles locale prefix redirects and rewrites).
  const i18nResponse = handleI18nRouting(request);

  // If next-intl issued a redirect (e.g. /en → /en with canonical redirect,
  // or locale mismatch), return it immediately.
  if (i18nResponse.status !== 200) {
    return i18nResponse;
  }

  // Step 2: Run Supabase session refresh on top of the i18nResponse.
  // We must set cookies on i18nResponse (not a new NextResponse.next()) so
  // that any URL rewrite next-intl embedded in that response is preserved.
  if (!hasEnvVars) {
    return i18nResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            i18nResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and getClaims().
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.includes('/auth');
  const isPublicAsset = pathname === '/manifest.webmanifest' || pathname.startsWith('/serwist/');

  if (!user && !isAuthRoute && !isPublicAsset) {
    const url = request.nextUrl.clone();
    // Detect locale: English has /en prefix, Spanish (default) has no prefix.
    const isEnglish = pathname.startsWith('/en/') || pathname === '/en';
    url.pathname = isEnglish ? '/en/auth/login' : '/auth/login';
    return NextResponse.redirect(url);
  }

  // Return the i18nResponse so any locale rewrite is preserved.
  return i18nResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|serwist|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
