import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveHostname } from '@rashx/database';

/**
 * Tenant Application Middleware
 *
 * Edge-compatible hostname resolution and tenant namespace isolation.
 *
 * HOST AUTHORITY PROVENANCE & MANAGED INGRESS ASSUMPTIONS:
 * 1. Authority Resolution:
 *    The application relies on the canonical host authority supplied directly by the managed
 *    hosting ingress (e.g. Vercel edge infrastructure), extracted via `request.headers.get('host')`
 *    with a verified framework fallback to `request.nextUrl.host`.
 * 2. Complete Elimination of Forwarding-Header Fallback:
 *    `X-Forwarded-Host` is NOT treated as an independent trust source and is NEVER used as a fallback
 *    for tenant resolution, project routing, canonical redirects, or authorization. This prevents
 *    host-spoofing and cross-tenant routing attacks regardless of client header tampering.
 * 3. Multi-Proxy Deployment Requirement:
 *    If an external proxy (such as Cloudflare or an enterprise reverse proxy) is introduced in front of
 *    Vercel, a separate security review is required to verify host preservation and header overwrite behavior.
 * 4. Header Stripping:
 *    Downstream internal routing headers (`x-rashx-tenant-slug`, `x-rashx-hostname`) are explicitly deleted
 *    from incoming requests before injecting verified internal metadata.
 * 5. Fail-Closed Routing:
 *    If no trusted host authority is available, the request strictly fails closed with an HTTP 404 error.
 * 6. Authoritative Verification:
 *    Middleware handles domain classification and fast edge routing only. Authoritative tenant existence
 *    and ACTIVE lifecycle status are verified directly against Firestore in the server runtime without
 *    stale cache bypass.
 */
export function middleware(request: NextRequest): NextResponse {
  // 1. Strip client-supplied routing headers to eliminate header spoofing
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-rashx-tenant-slug');
  requestHeaders.delete('x-rashx-hostname');

  // 2. Extract canonical host authority:
  // - Primary: Host header supplied by the managed hosting ingress.
  // - Framework fallback: request.nextUrl.host.
  // - Forwarding headers (x-forwarded-host) are strictly NEVER used.
  const rawHost = request.headers.get('host') || request.nextUrl.host;

  const resolution = resolveHostname(rawHost);

  // 3. Cross-Project Canonical Redirects
  // If traffic meant for the public website, main app, or admin hits the tenant project
  if (resolution.category === 'ROOT') {
    const targetUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${resolution.rootDomain}`);
    return NextResponse.redirect(targetUrl, 308);
  }

  if (resolution.category === 'APP') {
    const targetUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://app.${resolution.rootDomain}`);
    return NextResponse.redirect(targetUrl, 308);
  }

  if (resolution.category === 'ADMIN') {
    const targetUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://admin.${resolution.rootDomain}`);
    return NextResponse.redirect(targetUrl, 308);
  }

  // 4. Reject Invalid, Unknown, or Domain Suffix Attacks
  if (
    resolution.category === 'INVALID' ||
    resolution.category === 'UNKNOWN' ||
    resolution.category === 'PREVIEW'
  ) {
    return new NextResponse('Tenant Not Found or Invalid Hostname', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  // 5. Valid Tenant Hostname
  if (resolution.category === 'TENANT' && resolution.tenantSlug) {
    requestHeaders.set('x-rashx-tenant-slug', resolution.tenantSlug);
    requestHeaders.set('x-rashx-hostname', resolution.hostname);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 6. Development fallback (e.g. localhost:3002 without tenant subdomain)
  if (resolution.category === 'DEVELOPMENT') {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return new NextResponse('Not Found', { status: 404 });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (e.g. .svg, .png, .jpg)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
