import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware as tenantMiddleware } from '../../../apps/tenant/src/middleware';
import { middleware as appMiddleware } from '../../../apps/app/src/middleware';
import { middleware as adminMiddleware } from '../../../apps/admin/src/middleware';

describe('Next.js Edge Middleware — Hostname Resolution & Routing Isolation', () => {
  // -------------------------------------------------------------
  // Apps/Tenant Middleware Scenarios
  // -------------------------------------------------------------
  describe('Tenant Application Middleware (apps/tenant)', () => {
    it('allows valid tenant request and injects trusted x-rashx-tenant-slug header', () => {
      const request = new NextRequest('http://salon1.rashx.org/dashboard?period=month', {
        headers: {
          host: 'salon1.rashx.org',
        },
      });

      const response = tenantMiddleware(request);

      expect(response.status).toBe(200);
      expect(response.headers).toBeDefined();
    });

    it('neutralizes spoofed X-Forwarded-Host header when legitimate Host header is present', () => {
      // Malicious client sends Host: salon1.rashx.org but attempts to spoof victim tenant via X-Forwarded-Host
      const request = new NextRequest('http://salon1.rashx.org/dashboard', {
        headers: {
          host: 'salon1.rashx.org',
          'x-forwarded-host': 'attacker-target.rashx.org',
        },
      });

      const response = tenantMiddleware(request);
      expect(response.status).toBe(200);
    });

    it('strictly strips incoming client-supplied x-rashx-tenant-slug and x-rashx-hostname headers (anti-spoofing)', () => {
      const request = new NextRequest('http://salon1.rashx.org/dashboard', {
        headers: {
          host: 'salon1.rashx.org',
          'x-rashx-tenant-slug': 'attacker_forged_slug',
          'x-rashx-hostname': 'attacker_forged_host',
        },
      });

      const response = tenantMiddleware(request);
      expect(response.status).toBe(200);
    });

    it('redirects root domain request (rashx.org) to public website', () => {
      const request = new NextRequest('http://rashx.org/pricing?ref=banner', {
        headers: {
          host: 'rashx.org',
        },
      });

      const response = tenantMiddleware(request);

      expect(response.status).toBe(308);
      expect(response.headers.get('location')).toBe('https://rashx.org/pricing?ref=banner');
    });

    it('redirects www subdomain to public website', () => {
      const request = new NextRequest('http://www.rashx.org/about', {
        headers: {
          host: 'www.rashx.org',
        },
      });

      const response = tenantMiddleware(request);

      expect(response.status).toBe(308);
      expect(response.headers.get('location')).toBe('https://rashx.org/about');
    });

    it('redirects app.rashx.org to main application', () => {
      const request = new NextRequest('http://app.rashx.org/login', {
        headers: {
          host: 'app.rashx.org',
        },
      });

      const response = tenantMiddleware(request);

      expect(response.status).toBe(308);
      expect(response.headers.get('location')).toBe('https://app.rashx.org/login');
    });

    it('redirects admin.rashx.org to platform admin', () => {
      const request = new NextRequest('http://admin.rashx.org/dashboard', {
        headers: {
          host: 'admin.rashx.org',
        },
      });

      const response = tenantMiddleware(request);

      expect(response.status).toBe(308);
      expect(response.headers.get('location')).toBe('https://admin.rashx.org/dashboard');
    });

    it('strictly rejects reserved subdomains (api.rashx.org, auth.rashx.org) with 404', () => {
      const reqApi = new NextRequest('http://api.rashx.org/v1/health', {
        headers: { host: 'api.rashx.org' },
      });
      expect(tenantMiddleware(reqApi).status).toBe(404);

      const reqAuth = new NextRequest('http://auth.rashx.org/session', {
        headers: { host: 'auth.rashx.org' },
      });
      expect(tenantMiddleware(reqAuth).status).toBe(404);
    });

    it('strictly rejects full URLs passed in host header with 404', () => {
      const reqUrl = new NextRequest('http://dummy/test', {
        headers: { host: 'https://salon1.rashx.org' },
      });
      expect(tenantMiddleware(reqUrl).status).toBe(404);
    });

    it('strictly rejects out-of-range port in host header with 404', () => {
      const reqPort = new NextRequest('http://dummy/test', {
        headers: { host: 'salon1.rashx.org:99999' },
      });
      expect(tenantMiddleware(reqPort).status).toBe(404);
    });

    it('strictly rejects suffix spoofing attacks with 404', () => {
      const reqSuffix = new NextRequest('http://salon1-rashx.org/dashboard', {
        headers: { host: 'salon1-rashx.org' },
      });
      expect(tenantMiddleware(reqSuffix).status).toBe(404);

      const reqExternal = new NextRequest('http://rashx.org.attacker.com/dashboard', {
        headers: { host: 'rashx.org.attacker.com' },
      });
      expect(tenantMiddleware(reqExternal).status).toBe(404);
    });

    it('strictly rejects multi-label subdomains with 404', () => {
      const reqMulti = new NextRequest('http://foo.bar.rashx.org/dashboard', {
        headers: { host: 'foo.bar.rashx.org' },
      });
      expect(tenantMiddleware(reqMulti).status).toBe(404);
    });

    it('allows localhost development hostname in local environments', () => {
      const reqDev = new NextRequest('http://localhost:3002/dashboard', {
        headers: { host: 'localhost:3002' },
      });
      const response = tenantMiddleware(reqDev);
      expect(response.status).toBe(200);
    });
  });

  // -------------------------------------------------------------
  // Apps/App Middleware Scenarios
  // -------------------------------------------------------------
  describe('Main App Application Middleware (apps/app)', () => {
    it('allows valid app.rashx.org request', () => {
      const request = new NextRequest('http://app.rashx.org/dashboard', {
        headers: { host: 'app.rashx.org' },
      });
      const response = appMiddleware(request);
      expect(response.status).toBe(200);
    });

    it('redirects tenant subdomain to tenant app project', () => {
      const request = new NextRequest('http://salon1.rashx.org/booking', {
        headers: { host: 'salon1.rashx.org' },
      });
      const response = appMiddleware(request);
      expect(response.status).toBe(308);
      expect(response.headers.get('location')).toBe('https://salon1.rashx.org/booking');
    });

    it('redirects root domain to public website', () => {
      const request = new NextRequest('http://rashx.org/pricing', {
        headers: { host: 'rashx.org' },
      });
      const response = appMiddleware(request);
      expect(response.status).toBe(308);
      expect(response.headers.get('location')).toBe('https://rashx.org/pricing');
    });

    it('redirects admin domain to admin project', () => {
      const request = new NextRequest('http://admin.rashx.org/dashboard', {
        headers: { host: 'admin.rashx.org' },
      });
      const response = appMiddleware(request);
      expect(response.status).toBe(308);
      expect(response.headers.get('location')).toBe('https://admin.rashx.org/dashboard');
    });

    it('rejects unrecognized hostnames with 404', () => {
      const request = new NextRequest('http://evil.com/app', {
        headers: { host: 'evil.com' },
      });
      const response = appMiddleware(request);
      expect(response.status).toBe(404);
    });
  });

  // -------------------------------------------------------------
  // Apps/Admin Middleware Scenarios
  // -------------------------------------------------------------
  describe('Admin Application Middleware (apps/admin)', () => {
    it('allows valid admin.rashx.org request', () => {
      const request = new NextRequest('http://admin.rashx.org/dashboard', {
        headers: { host: 'admin.rashx.org' },
      });
      const response = adminMiddleware(request);
      expect(response.status).toBe(200);
    });

    it('redirects tenant subdomain to tenant project', () => {
      const request = new NextRequest('http://salon1.rashx.org/admin', {
        headers: { host: 'salon1.rashx.org' },
      });
      const response = adminMiddleware(request);
      expect(response.status).toBe(308);
      expect(response.headers.get('location')).toBe('https://salon1.rashx.org/admin');
    });

    it('redirects root domain to public website', () => {
      const request = new NextRequest('http://rashx.org/contact', {
        headers: { host: 'rashx.org' },
      });
      const response = adminMiddleware(request);
      expect(response.status).toBe(308);
      expect(response.headers.get('location')).toBe('https://rashx.org/contact');
    });

    it('redirects app domain to main app project', () => {
      const request = new NextRequest('http://app.rashx.org/dashboard', {
        headers: { host: 'app.rashx.org' },
      });
      const response = adminMiddleware(request);
      expect(response.status).toBe(308);
      expect(response.headers.get('location')).toBe('https://app.rashx.org/dashboard');
    });

    it('rejects unrecognized hostnames with 404', () => {
      const request = new NextRequest('http://unknown-domain.com/dashboard', {
        headers: { host: 'unknown-domain.com' },
      });
      const response = adminMiddleware(request);
      expect(response.status).toBe(404);
    });
  });

  // -------------------------------------------------------------
  // Final Host Authority Hardening: Forwarding-Header Removal
  // -------------------------------------------------------------
  describe('Host Authority Ingress Hardening (Complete x-forwarded-host Removal)', () => {
    // 1. Tenant Middleware
    describe('apps/tenant ingress isolation', () => {
      it('valid Host wins even if X-Forwarded-Host contains another tenant', () => {
        const req = new NextRequest('http://salon1.rashx.org/dashboard', {
          headers: {
            host: 'salon1.rashx.org',
            'x-forwarded-host': 'victim-tenant.rashx.org',
          },
        });
        const res = tenantMiddleware(req);
        expect(res.status).toBe(200);
      });

      it('missing Host with valid request.nextUrl.host uses the verified framework fallback', () => {
        const req = new NextRequest('http://salon1.rashx.org/dashboard');
        // No host in headers; nextUrl.host is salon1.rashx.org
        expect(req.headers.get('host')).toBeNull();
        expect(req.nextUrl.host).toBe('salon1.rashx.org');

        const res = tenantMiddleware(req);
        expect(res.status).toBe(200);
      });

      it('missing both Host and request.nextUrl.host, with a forged X-Forwarded-Host, fails closed', () => {
        const req = new NextRequest('http://dummy/dashboard', {
          headers: {
            'x-forwarded-host': 'salon1.rashx.org',
          },
        });
        // Clear nextUrl.host to simulate absence of both authorities
        Object.defineProperty(req.nextUrl, 'host', { value: '' });
        expect(req.headers.get('host')).toBeNull();
        expect(req.nextUrl.host).toBe('');

        const res = tenantMiddleware(req);
        // Must fail closed with 404, NEVER routing to salon1 via forged forwarding header
        expect(res.status).toBe(404);
      });

      it('forged forwarding headers cannot cause cross-tenant routing', () => {
        const req = new NextRequest('http://salon1.rashx.org/dashboard', {
          headers: {
            host: 'salon1.rashx.org',
            'x-forwarded-host': 'different-salon.rashx.org',
          },
        });
        const res = tenantMiddleware(req);
        expect(res.status).toBe(200);
      });
    });

    // 2. App Middleware
    describe('apps/app ingress isolation', () => {
      it('valid Host wins even if X-Forwarded-Host contains another tenant', () => {
        const req = new NextRequest('http://app.rashx.org/dashboard', {
          headers: {
            host: 'app.rashx.org',
            'x-forwarded-host': 'salon1.rashx.org',
          },
        });
        const res = appMiddleware(req);
        // Valid Host is app.rashx.org -> returns 200, DOES NOT redirect to salon1
        expect(res.status).toBe(200);
      });

      it('missing Host with valid request.nextUrl.host uses verified framework fallback', () => {
        const req = new NextRequest('http://app.rashx.org/dashboard');
        expect(req.headers.get('host')).toBeNull();
        expect(req.nextUrl.host).toBe('app.rashx.org');

        const res = appMiddleware(req);
        expect(res.status).toBe(200);
      });

      it('missing both Host and request.nextUrl.host, with forged X-Forwarded-Host, fails closed', () => {
        const req = new NextRequest('http://dummy/dashboard', {
          headers: {
            'x-forwarded-host': 'app.rashx.org',
          },
        });
        Object.defineProperty(req.nextUrl, 'host', { value: '' });

        const res = appMiddleware(req);
        expect(res.status).toBe(404);
      });
    });

    // 3. Admin Middleware
    describe('apps/admin ingress isolation', () => {
      it('valid Host wins even if X-Forwarded-Host contains another tenant', () => {
        const req = new NextRequest('http://admin.rashx.org/dashboard', {
          headers: {
            host: 'admin.rashx.org',
            'x-forwarded-host': 'salon1.rashx.org',
          },
        });
        const res = adminMiddleware(req);
        // Valid Host is admin.rashx.org -> returns 200, DOES NOT redirect to salon1
        expect(res.status).toBe(200);
      });

      it('missing Host with valid request.nextUrl.host uses verified framework fallback', () => {
        const req = new NextRequest('http://admin.rashx.org/dashboard');
        expect(req.headers.get('host')).toBeNull();
        expect(req.nextUrl.host).toBe('admin.rashx.org');

        const res = adminMiddleware(req);
        expect(res.status).toBe(200);
      });

      it('missing both Host and request.nextUrl.host, with forged X-Forwarded-Host, fails closed', () => {
        const req = new NextRequest('http://dummy/dashboard', {
          headers: {
            'x-forwarded-host': 'admin.rashx.org',
          },
        });
        Object.defineProperty(req.nextUrl, 'host', { value: '' });

        const res = adminMiddleware(req);
        expect(res.status).toBe(404);
      });
    });
  });
});
