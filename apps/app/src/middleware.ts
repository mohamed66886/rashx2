import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveHostname } from '@rashx/database';

/**
 * Main Application Middleware (app.rashx.org)
 *
 * Enforces hostname isolation and cross-project routing boundaries.
 *
 * HOST AUTHORITY PROVENANCE & MANAGED INGRESS ASSUMPTIONS:
 * 1. Authority Resolution:
 *    The application relies on the canonical host authority supplied directly by the managed
 *    hosting ingress (e.g. Vercel edge infrastructure), extracted via `request.headers.get('host')`
 *    with a verified framework fallback to `request.nextUrl.host`.
 * 2. Complete Elimination of Forwarding-Header Fallback:
 *    `X-Forwarded-Host` is NOT treated as an independent trust source and is NEVER used as a fallback
 *    for project routing, canonical redirects, or authorization.
 * 3. Multi-Proxy Deployment Requirement:
 *    If an external proxy (such as Cloudflare or an enterprise reverse proxy) is introduced in front of
 *    Vercel, a separate security review is required to verify host preservation and header overwrite behavior.
 * 4. Header Stripping:
 *    Downstream routing headers (`x-rashx-tenant-slug`, `x-rashx-hostname`) are deleted from incoming requests.
 * 5. Fail-Closed Routing:
 *    If no trusted host authority is available, the request strictly fails closed with an HTTP 404 error.
 */
export function middleware(request: NextRequest): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-rashx-tenant-slug');
  requestHeaders.delete('x-rashx-hostname');

  // Extract canonical host authority:
  // - Primary: Host header supplied by the managed hosting ingress.
  // - Framework fallback: request.nextUrl.host.
  // - Forwarding headers (x-forwarded-host) are strictly NEVER used.
  const rawHost = request.headers.get('host') || request.nextUrl.host;

  const resolution = resolveHostname(rawHost);

  // If a tenant subdomain hits app.rashx.org, redirect to tenant project
  if (resolution.category === 'TENANT') {
    const targetUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${resolution.hostname}`);
    return NextResponse.redirect(targetUrl, 308);
  }

  // If root domain hits app project, redirect to public website
  if (resolution.category === 'ROOT') {
    const targetUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${resolution.rootDomain}`);
    return NextResponse.redirect(targetUrl, 308);
  }

  // If admin domain hits app project, redirect to admin
  if (resolution.category === 'ADMIN') {
    const targetUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://admin.${resolution.rootDomain}`);
    return NextResponse.redirect(targetUrl, 308);
  }

  // Reject unrecognized external hosts
  if (resolution.category === 'INVALID' || resolution.category === 'UNKNOWN') {
    return new NextResponse('Application Not Found or Invalid Hostname', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
