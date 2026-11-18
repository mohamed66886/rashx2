import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';
import { LANG_COOKIE, LANG_HEADER } from '@rashx/i18n/types';

describe('Middleware i18n & Routing Verification', () => {
  it('redirects /ar to clean / with Arabic cookie (ADR 0003 compliance)', () => {
    const request = new NextRequest('http://localhost:3000/ar');
    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/');
    expect(response.cookies.get(LANG_COOKIE)?.value).toBe('ar');
  });

  it('redirects /ar/about to clean /about with Arabic cookie', () => {
    const request = new NextRequest('http://localhost:3000/ar/about');
    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/about');
    expect(response.cookies.get(LANG_COOKIE)?.value).toBe('ar');
  });

  it('redirects /en to /?lang=en with English cookie', () => {
    const request = new NextRequest('http://localhost:3000/en');
    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/?lang=en');
    expect(response.cookies.get(LANG_COOKIE)?.value).toBe('en');
  });

  it('redirects /en/pricing to /pricing?lang=en with English cookie', () => {
    const request = new NextRequest('http://localhost:3000/en/pricing');
    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/pricing?lang=en');
    expect(response.cookies.get(LANG_COOKIE)?.value).toBe('en');
  });

  it('defaults to Arabic on root path without query params', () => {
    const request = new NextRequest('http://localhost:3000/');
    const response = middleware(request);

    expect(response.status).toBe(200);
    expect(response.headers.get(LANG_HEADER)).toBe('ar');
  });

  it('detects and persists ?lang=en on root path', () => {
    const request = new NextRequest('http://localhost:3000/?lang=en');
    const response = middleware(request);

    expect(response.status).toBe(200);
    expect(response.headers.get(LANG_HEADER)).toBe('en');
    expect(response.cookies.get(LANG_COOKIE)?.value).toBe('en');
  });
});
