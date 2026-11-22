import { describe, it, expect } from 'vitest';
import { resolveHostname } from '../src/hostname';

describe('Strict Hostname Authority Resolver (resolveHostname)', () => {
  const rootDomain = 'rashx.org';

  // -------------------------------------------------------------
  // 1. Apex & Platform Domains
  // -------------------------------------------------------------
  describe('Apex & Platform Subdomains', () => {
    it('resolves apex domain to ROOT', () => {
      const res = resolveHostname('rashx.org', { rootDomain });
      expect(res.category).toBe('ROOT');
      expect(res.hostname).toBe('rashx.org');
      expect(res.tenantSlug).toBeNull();
      expect(res.rootDomain).toBe('rashx.org');
    });

    it('resolves www subdomain to ROOT', () => {
      const res = resolveHostname('www.rashx.org', { rootDomain });
      expect(res.category).toBe('ROOT');
      expect(res.hostname).toBe('www.rashx.org');
      expect(res.tenantSlug).toBeNull();
    });

    it('resolves app subdomain to APP', () => {
      const res = resolveHostname('app.rashx.org', { rootDomain });
      expect(res.category).toBe('APP');
      expect(res.hostname).toBe('app.rashx.org');
      expect(res.tenantSlug).toBeNull();
    });

    it('resolves admin subdomain to ADMIN', () => {
      const res = resolveHostname('admin.rashx.org', { rootDomain });
      expect(res.category).toBe('ADMIN');
      expect(res.hostname).toBe('admin.rashx.org');
      expect(res.tenantSlug).toBeNull();
    });
  });

  // -------------------------------------------------------------
  // 2. Valid Tenant Subdomains
  // -------------------------------------------------------------
  describe('Valid Tenant Subdomains', () => {
    it('resolves valid single-label tenant subdomains to TENANT', () => {
      const res1 = resolveHostname('salon1.rashx.org', { rootDomain });
      expect(res1.category).toBe('TENANT');
      expect(res1.hostname).toBe('salon1.rashx.org');
      expect(res1.tenantSlug).toBe('salon1');

      const res2 = resolveHostname('riyadh-barber.rashx.org', { rootDomain });
      expect(res2.category).toBe('TENANT');
      expect(res2.hostname).toBe('riyadh-barber.rashx.org');
      expect(res2.tenantSlug).toBe('riyadh-barber');

      const res3 = resolveHostname('my-salon.rashx.org', { rootDomain });
      expect(res3.category).toBe('TENANT');
      expect(res3.hostname).toBe('my-salon.rashx.org');
      expect(res3.tenantSlug).toBe('my-salon');
    });
  });

  // -------------------------------------------------------------
  // 3. Strict Rejection of URLs, Protocols, Paths, Queries & Userinfo
  // -------------------------------------------------------------
  describe('Strict Authority Boundary Validation (No Silent URL Stripping)', () => {
    it('strictly rejects full URLs with protocols (https://, http://)', () => {
      const resHttps = resolveHostname('https://salon1.rashx.org', { rootDomain });
      expect(resHttps.category).toBe('INVALID');
      expect(resHttps.reason).toContain('protocol, path, query, fragment, userinfo');

      const resHttp = resolveHostname('http://salon1.rashx.org/dashboard', { rootDomain });
      expect(resHttp.category).toBe('INVALID');
      expect(resHttp.reason).toContain('protocol, path, query, fragment, userinfo');
    });

    it('strictly rejects authorities containing paths (/dashboard)', () => {
      const res = resolveHostname('salon1.rashx.org/dashboard', { rootDomain });
      expect(res.category).toBe('INVALID');
      expect(res.reason).toContain('protocol, path, query, fragment, userinfo');
    });

    it('strictly rejects authorities containing queries (?x=1)', () => {
      const res = resolveHostname('salon1.rashx.org?x=1', { rootDomain });
      expect(res.category).toBe('INVALID');
      expect(res.reason).toContain('protocol, path, query, fragment, userinfo');
    });

    it('strictly rejects authorities containing fragments (#fragment)', () => {
      const res = resolveHostname('salon1.rashx.org#fragment', { rootDomain });
      expect(res.category).toBe('INVALID');
      expect(res.reason).toContain('protocol, path, query, fragment, userinfo');
    });

    it('strictly rejects authorities containing userinfo (user@...)', () => {
      const res = resolveHostname('user@salon1.rashx.org', { rootDomain });
      expect(res.category).toBe('INVALID');
      expect(res.reason).toContain('protocol, path, query, fragment, userinfo');
    });

    it('strictly rejects authorities containing whitespace or backslashes', () => {
      expect(resolveHostname('salon1 .rashx.org', { rootDomain }).category).toBe('INVALID');
      expect(resolveHostname('salon1.rashx.org\\path', { rootDomain }).category).toBe('INVALID');
    });

    it('strictly rejects empty or null authority strings', () => {
      expect(resolveHostname('', { rootDomain }).category).toBe('INVALID');
      expect(resolveHostname('   ', { rootDomain }).category).toBe('INVALID');
      expect(resolveHostname(null as any, { rootDomain }).category).toBe('INVALID');
      expect(resolveHostname(undefined as any, { rootDomain }).category).toBe('INVALID');
    });
  });

  // -------------------------------------------------------------
  // 4. Numeric Port Validation Boundaries (1-65535)
  // -------------------------------------------------------------
  describe('Numeric Port Validation & Boundaries', () => {
    it('accepts valid numeric ports within the 1-65535 range', () => {
      const res443 = resolveHostname('salon1.rashx.org:443', { rootDomain });
      expect(res443.category).toBe('TENANT');
      expect(res443.hostname).toBe('salon1.rashx.org');
      expect(res443.tenantSlug).toBe('salon1');

      const resMin = resolveHostname('salon1.rashx.org:1', { rootDomain });
      expect(resMin.category).toBe('TENANT');
      expect(resMin.hostname).toBe('salon1.rashx.org');

      const resMax = resolveHostname('salon1.rashx.org:65535', { rootDomain });
      expect(resMax.category).toBe('TENANT');
      expect(resMax.hostname).toBe('salon1.rashx.org');

      const resDev = resolveHostname('localhost:3000', { rootDomain });
      expect(resDev.category).toBe('DEVELOPMENT');
      expect(resDev.hostname).toBe('localhost');

      const resLocalTenant = resolveHostname('salon1.localhost:3002', { rootDomain });
      expect(resLocalTenant.category).toBe('TENANT');
      expect(resLocalTenant.tenantSlug).toBe('salon1');
    });

    it('strictly rejects out-of-range ports (0, 65536, 99999)', () => {
      const res0 = resolveHostname('salon1.rashx.org:0', { rootDomain });
      expect(res0.category).toBe('INVALID');
      expect(res0.reason).toContain('out of valid range');

      const res65536 = resolveHostname('salon1.rashx.org:65536', { rootDomain });
      expect(res65536.category).toBe('INVALID');
      expect(res65536.reason).toContain('out of valid range');

      const res99999 = resolveHostname('salon1.rashx.org:99999', { rootDomain });
      expect(res99999.category).toBe('INVALID');
      expect(res99999.reason).toContain('out of valid range');
    });

    it('strictly rejects malformed or non-numeric ports (:abc, empty)', () => {
      const resAbc = resolveHostname('salon1.rashx.org:abc', { rootDomain });
      expect(resAbc.category).toBe('INVALID');
      expect(resAbc.reason).toContain('non-numeric port');

      const resEmptyPort = resolveHostname('salon1.rashx.org:', { rootDomain });
      expect(resEmptyPort.category).toBe('INVALID');
      expect(resEmptyPort.reason).toContain('missing host or port component');

      const resMissingHost = resolveHostname(':3000', { rootDomain });
      expect(resMissingHost.category).toBe('INVALID');
      expect(resMissingHost.reason).toContain('missing host or port component');

      const resMultiColon = resolveHostname('salon1.rashx.org:80:80', { rootDomain });
      expect(resMultiColon.category).toBe('INVALID');
      expect(resMultiColon.reason).toContain('multiple colons');
    });
  });

  // -------------------------------------------------------------
  // 5. Case Normalization & Trailing FQDN Dot
  // -------------------------------------------------------------
  describe('Normalization (Case & FQDN Trailing Dot)', () => {
    it('normalizes uppercase and mixed-case hostnames', () => {
      const res1 = resolveHostname('SALON1.RASHX.ORG', { rootDomain });
      expect(res1.category).toBe('TENANT');
      expect(res1.tenantSlug).toBe('salon1');
      expect(res1.hostname).toBe('salon1.rashx.org');

      const res2 = resolveHostname('App.RashX.Org:443', { rootDomain });
      expect(res2.category).toBe('APP');
      expect(res2.hostname).toBe('app.rashx.org');
    });

    it('normalizes single trailing FQDN root dot', () => {
      const resTenant = resolveHostname('salon1.rashx.org.', { rootDomain });
      expect(resTenant.category).toBe('TENANT');
      expect(resTenant.hostname).toBe('salon1.rashx.org');
      expect(resTenant.tenantSlug).toBe('salon1');

      const resRoot = resolveHostname('rashx.org.', { rootDomain });
      expect(resRoot.category).toBe('ROOT');
      expect(resRoot.hostname).toBe('rashx.org');

      const resApp = resolveHostname('app.rashx.org.', { rootDomain });
      expect(resApp.category).toBe('APP');
      expect(resApp.hostname).toBe('app.rashx.org');
    });

    it('rejects multiple trailing dots or standalone dot', () => {
      expect(resolveHostname('salon1.rashx.org..', { rootDomain }).category).toBe('INVALID');
      expect(resolveHostname('.', { rootDomain }).category).toBe('INVALID');
      expect(resolveHostname('..', { rootDomain }).category).toBe('INVALID');
    });
  });

  // -------------------------------------------------------------
  // 6. Domain Suffix & Prefix Attacks
  // -------------------------------------------------------------
  describe('Domain Suffix & Prefix Attacks', () => {
    it('strictly classifies suffix spoofing attempts as UNKNOWN (never TENANT)', () => {
      const res1 = resolveHostname('salon1-rashx.org', { rootDomain });
      expect(res1.category).toBe('UNKNOWN');
      expect(res1.tenantSlug).toBeNull();

      const res2 = resolveHostname('rashx.org.attacker.com', { rootDomain });
      expect(res2.category).toBe('UNKNOWN');
      expect(res2.tenantSlug).toBeNull();

      const res3 = resolveHostname('attacker-rashx.org', { rootDomain });
      expect(res3.category).toBe('UNKNOWN');
      expect(res3.tenantSlug).toBeNull();

      const res4 = resolveHostname('competitor.sa', { rootDomain });
      expect(res4.category).toBe('UNKNOWN');
      expect(res4.tenantSlug).toBeNull();
    });
  });

  // -------------------------------------------------------------
  // 7. Multi-Label Subdomains
  // -------------------------------------------------------------
  describe('Multi-Label Subdomains Rejection', () => {
    it('strictly rejects multi-label subdomains under root domain', () => {
      const res = resolveHostname('foo.bar.rashx.org', { rootDomain });
      expect(res.category).toBe('INVALID');
      expect(res.reason).toContain('Multi-label subdomains are not permitted');

      const res3 = resolveHostname('a.b.c.rashx.org', { rootDomain });
      expect(res3.category).toBe('INVALID');
    });

    it('strictly rejects multi-label subdomains on localhost', () => {
      const res = resolveHostname('sub.sub2.localhost', { rootDomain });
      expect(res.category).toBe('INVALID');
      expect(res.reason).toContain('Multi-label subdomains are not permitted on localhost');
    });
  });

  // -------------------------------------------------------------
  // 8. Reserved Subdomain Protection
  // -------------------------------------------------------------
  describe('Reserved Subdomain Protection', () => {
    it('strictly rejects reserved subdomains from resolving as tenants', () => {
      const reservedList = [
        'api', 'auth', 'assets', 'static', 'mail', 'support', 'status',
        'pricing', 'billing', 'portal', 'dashboard', 'login', 'signup',
        'register', 'docs', 'help', 'staging', 'dev',
      ];

      for (const reserved of reservedList) {
        const res = resolveHostname(`${reserved}.rashx.org`, { rootDomain });
        expect(res.category).toBe('INVALID');
        expect(res.tenantSlug).toBeNull();
        expect(res.reason).toContain('reserved');
      }
    });
  });

  // -------------------------------------------------------------
  // 9. Localhost & Vercel Preview Deployments
  // -------------------------------------------------------------
  describe('Localhost & Preview Environments', () => {
    it('handles localhost and 127.0.0.1 development environments', () => {
      expect(resolveHostname('localhost', { rootDomain }).category).toBe('DEVELOPMENT');
      expect(resolveHostname('127.0.0.1', { rootDomain }).category).toBe('DEVELOPMENT');
      expect(resolveHostname('localhost:3002', { rootDomain }).category).toBe('DEVELOPMENT');
    });

    it('classifies Vercel preview hostnames as PREVIEW', () => {
      const res = resolveHostname('rashx-app-pr-123.vercel.app', { rootDomain });
      expect(res.category).toBe('PREVIEW');
      expect(res.tenantSlug).toBeNull();
    });
  });
});
