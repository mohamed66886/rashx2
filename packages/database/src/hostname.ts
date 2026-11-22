import { SlugFormatSchema, RESERVED_SLUGS } from './slug.schema';

/**
 * Categorized classifications for incoming hostnames across RASHX infrastructure.
 */
export type HostnameCategory =
  | 'ROOT'
  | 'APP'
  | 'ADMIN'
  | 'TENANT'
  | 'DEVELOPMENT'
  | 'PREVIEW'
  | 'UNKNOWN'
  | 'INVALID';

/**
 * Structured outcome returned by the canonical hostname resolver.
 */
export interface HostnameResolution {
  category: HostnameCategory;
  hostname: string;
  tenantSlug: string | null;
  rootDomain: string;
  isCustomDomain: boolean;
  reason?: string;
}

export interface ResolveHostnameOptions {
  rootDomain?: string;
}

const RESERVED_SLUGS_SET = new Set<string>(RESERVED_SLUGS);

/**
 * Canonical hostname resolver for RASHX multi-tenant routing.
 *
 * Enforces strict RFC hostname authority validation, domain boundary matching,
 * case normalization, numeric port validation (1-65535), reserved subdomain protection,
 * and slug syntax validation.
 *
 * SECURITY & MATCHING RULES:
 * 1. Authority Validation: Rejects strings containing protocol schemes ('http://', 'https://'),
 *    paths ('/'), queries ('?'), fragments ('#'), userinfo ('@'), or whitespace. Hostname parsers
 *    must never silently turn an arbitrary URL into a valid Host header.
 * 2. Port Validation: Accepts optional numeric port in the valid range 1–65535 (e.g. :443, :3000).
 *    Rejects non-numeric (:abc) or out-of-range ports (:0, :65536, :99999).
 * 3. Case Normalization: Hostname is converted to lowercase before parsing.
 * 4. Trailing FQDN Dot: Single trailing root dot (e.g. 'salon1.rashx.org.') is normalized.
 * 5. Exact Domain Boundary: Substrings like `hostname.includes('rashx.org')` are NEVER used.
 *    Domain suffix attacks such as `rashx.org.attacker.com` or `attacker-rashx.org` are rejected as UNKNOWN.
 * 6. Multi-Label Subdomain Rejection: Multi-level subdomains like `a.b.rashx.org` are rejected as INVALID.
 * 7. Reserved Subdomains: `www`, `app`, `admin`, `api`, `auth`, `mail`, `status`, etc., are protected
 *    and can never resolve as tenant slugs.
 * 8. Localhost & Development: `localhost`, `127.0.0.1`, and `*.localhost` are safely handled for development.
 * 9. Vercel Previews: `*.vercel.app` domains are classified as PREVIEW and never resolve as tenants.
 *
 * @param rawHostname Incoming host or authority value (e.g. 'salon1.rashx.org', 'localhost:3000')
 * @param options Configuration options including custom root domain
 */
export function resolveHostname(
  rawHostname: string | null | undefined,
  options?: ResolveHostnameOptions
): HostnameResolution {
  const rootDomain = (
    options?.rootDomain ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ROOT_DOMAIN) ||
    'rashx.org'
  )
    .trim()
    .toLowerCase();

  // 1. Guard against empty, null, or non-string inputs
  if (!rawHostname || typeof rawHostname !== 'string' || rawHostname.trim() === '') {
    return {
      category: 'INVALID',
      hostname: '',
      tenantSlug: null,
      rootDomain,
      isCustomDomain: false,
      reason: 'Empty or missing hostname authority',
    };
  }

  const trimmed = rawHostname.trim();

  // 2. Strict authority boundary validation: reject protocols, paths, queries, fragments, userinfo, whitespace
  if (
    trimmed.includes('/') ||
    trimmed.includes('?') ||
    trimmed.includes('#') ||
    trimmed.includes('@') ||
    /\s/.test(trimmed) ||
    trimmed.includes('\\')
  ) {
    return {
      category: 'INVALID',
      hostname: trimmed,
      tenantSlug: null,
      rootDomain,
      isCustomDomain: false,
      reason: 'Hostname authority must not contain protocol, path, query, fragment, userinfo, or whitespace',
    };
  }

  // 3. Port parsing and validation
  let hostPart = trimmed;
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':');
    if (parts.length !== 2) {
      return {
        category: 'INVALID',
        hostname: trimmed,
        tenantSlug: null,
        rootDomain,
        isCustomDomain: false,
        reason: 'Malformed authority with multiple colons',
      };
    }

    const [rawHost, rawPort] = parts;
    if (!rawHost || !rawPort) {
      return {
        category: 'INVALID',
        hostname: trimmed,
        tenantSlug: null,
        rootDomain,
        isCustomDomain: false,
        reason: 'Malformed authority: missing host or port component',
      };
    }

    // Port must be strictly numeric digits
    if (!/^\d+$/.test(rawPort)) {
      return {
        category: 'INVALID',
        hostname: trimmed,
        tenantSlug: null,
        rootDomain,
        isCustomDomain: false,
        reason: `Invalid port '${rawPort}': non-numeric port specified`,
      };
    }

    const portNum = parseInt(rawPort, 10);
    if (portNum < 1 || portNum > 65535) {
      return {
        category: 'INVALID',
        hostname: trimmed,
        tenantSlug: null,
        rootDomain,
        isCustomDomain: false,
        reason: `Port '${rawPort}' out of valid range (1-65535)`,
      };
    }

    hostPart = rawHost;
  }

  // 4. Case normalization
  let host = hostPart.toLowerCase();

  // 5. DNS FQDN trailing dot normalization (e.g. salon1.rashx.org. -> salon1.rashx.org)
  if (host.endsWith('.')) {
    if (host === '.') {
      return {
        category: 'INVALID',
        hostname: host,
        tenantSlug: null,
        rootDomain,
        isCustomDomain: false,
        reason: 'Empty hostname label',
      };
    }
    host = host.slice(0, -1);
  }

  // 6. Strict RFC hostname syntax validation
  // Hostname must only contain a-z, 0-9, dots, and hyphens.
  if (!/^[a-z0-9.-]+$/.test(host)) {
    return {
      category: 'INVALID',
      hostname: host,
      tenantSlug: null,
      rootDomain,
      isCustomDomain: false,
      reason: 'Hostname contains invalid characters (only lowercase alphanumeric, dots, and hyphens allowed)',
    };
  }

  // Check for consecutive dots or leading/trailing hyphens/dots
  if (host.includes('..') || host.startsWith('.') || host.startsWith('-') || host.endsWith('-')) {
    return {
      category: 'INVALID',
      hostname: host,
      tenantSlug: null,
      rootDomain,
      isCustomDomain: false,
      reason: 'Malformed hostname structure (consecutive dots or leading/trailing hyphens)',
    };
  }

  const labels = host.split('.');
  for (const label of labels) {
    if (label.length === 0 || label.length > 63 || label.startsWith('-') || label.endsWith('-')) {
      return {
        category: 'INVALID',
        hostname: host,
        tenantSlug: null,
        rootDomain,
        isCustomDomain: false,
        reason: `Invalid hostname label: '${label}'`,
      };
    }
  }

  // 7. Localhost & Development Environment Matching
  if (host === 'localhost' || host === '127.0.0.1') {
    return {
      category: 'DEVELOPMENT',
      hostname: host,
      tenantSlug: null,
      rootDomain,
      isCustomDomain: false,
    };
  }

  // Handle subdomain on localhost (e.g. salon1.localhost)
  if (host.endsWith('.localhost')) {
    const sub = host.slice(0, -('.localhost'.length));
    if (sub.includes('.')) {
      return {
        category: 'INVALID',
        hostname: host,
        tenantSlug: null,
        rootDomain,
        isCustomDomain: false,
        reason: 'Multi-label subdomains are not permitted on localhost',
      };
    }

    if (sub === 'app') {
      return { category: 'APP', hostname: host, tenantSlug: null, rootDomain, isCustomDomain: false };
    }
    if (sub === 'admin') {
      return { category: 'ADMIN', hostname: host, tenantSlug: null, rootDomain, isCustomDomain: false };
    }
    if (sub === 'www') {
      return { category: 'ROOT', hostname: host, tenantSlug: null, rootDomain, isCustomDomain: false };
    }
    if (RESERVED_SLUGS_SET.has(sub)) {
      return {
        category: 'INVALID',
        hostname: host,
        tenantSlug: null,
        rootDomain,
        isCustomDomain: false,
        reason: `Subdomain '${sub}' is a reserved platform keyword`,
      };
    }

    const slugValidation = SlugFormatSchema.safeParse(sub);
    if (!slugValidation.success) {
      return {
        category: 'INVALID',
        hostname: host,
        tenantSlug: null,
        rootDomain,
        isCustomDomain: false,
        reason: slugValidation.error.issues[0]?.message || `Invalid tenant slug '${sub}'`,
      };
    }

    return {
      category: 'TENANT',
      hostname: host,
      tenantSlug: sub,
      rootDomain,
      isCustomDomain: false,
    };
  }

  // 8. Vercel Preview Deployments (e.g. *.vercel.app)
  if (host.endsWith('.vercel.app')) {
    return {
      category: 'PREVIEW',
      hostname: host,
      tenantSlug: null,
      rootDomain,
      isCustomDomain: false,
      reason: 'Vercel preview deployment host',
    };
  }

  // 9. Exact Apex Domain Match (e.g. rashx.org)
  if (host === rootDomain) {
    return {
      category: 'ROOT',
      hostname: host,
      tenantSlug: null,
      rootDomain,
      isCustomDomain: false,
    };
  }

  // 10. Subdomains under the Root Domain (e.g. *.rashx.org)
  const subdomainSuffix = `.${rootDomain}`;
  if (host.endsWith(subdomainSuffix)) {
    const sub = host.slice(0, -subdomainSuffix.length);

    // Multi-label subdomains (e.g. a.b.rashx.org) are strictly rejected
    if (sub.includes('.')) {
      return {
        category: 'INVALID',
        hostname: host,
        tenantSlug: null,
        rootDomain,
        isCustomDomain: false,
        reason: 'Multi-label subdomains are not permitted',
      };
    }

    // Canonical WWW alias -> ROOT
    if (sub === 'www') {
      return {
        category: 'ROOT',
        hostname: host,
        tenantSlug: null,
        rootDomain,
        isCustomDomain: false,
      };
    }

    // Platform Main App -> APP
    if (sub === 'app') {
      return {
        category: 'APP',
        hostname: host,
        tenantSlug: null,
        rootDomain,
        isCustomDomain: false,
      };
    }

    // Platform Administration -> ADMIN
    if (sub === 'admin') {
      return {
        category: 'ADMIN',
        hostname: host,
        tenantSlug: null,
        rootDomain,
        isCustomDomain: false,
      };
    }

    // Reserved platform subdomains (api, auth, assets, static, mail, support, status, etc.)
    if (RESERVED_SLUGS_SET.has(sub)) {
      return {
        category: 'INVALID',
        hostname: host,
        tenantSlug: null,
        rootDomain,
        isCustomDomain: false,
        reason: `Subdomain '${sub}' is a reserved platform keyword and cannot be used as a tenant`,
      };
    }

    // Tenant Subdomain Validation against canonical SlugFormatSchema
    const slugValidation = SlugFormatSchema.safeParse(sub);
    if (!slugValidation.success) {
      return {
        category: 'INVALID',
        hostname: host,
        tenantSlug: null,
        rootDomain,
        isCustomDomain: false,
        reason: slugValidation.error.issues[0]?.message || `Invalid tenant slug format: '${sub}'`,
      };
    }

    // Valid Tenant Subdomain
    return {
      category: 'TENANT',
      hostname: host,
      tenantSlug: sub,
      rootDomain,
      isCustomDomain: false,
    };
  }

  // 11. External / Unrecognized Domains (e.g. attacker.com, rashx.org.attacker.com, competitor.sa, salon1-rashx.org)
  // Must NEVER silently resolve as a tenant!
  return {
    category: 'UNKNOWN',
    hostname: host,
    tenantSlug: null,
    rootDomain,
    isCustomDomain: false,
    reason: `Unrecognized domain: '${host}' does not belong to root domain '${rootDomain}'`,
  };
}
