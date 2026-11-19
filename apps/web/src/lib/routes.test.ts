import { describe, it, expect } from 'vitest';
import { routes } from './routes';

describe('Route Registry', () => {
  it('should define core corporate routes', () => {
    expect(routes.home).toBe('/');
    expect(routes.about).toBe('/about');
    expect(routes.founder.index).toBe('/founder');
    expect(routes.contact).toBe('/contact');
  });

  it('should define platform routes', () => {
    expect(routes.platform).toBe('/platform');
    expect(routes.features).toBe('/features');
    expect(routes.solutions.management).toBe('/solutions/management');
    expect(routes.solutions.hr).toBe('/solutions/hr');
    expect(routes.solutions.crm).toBe('/solutions/crm');
    expect(routes.solutions.booking).toBe('/solutions/booking');
  });

  it('should generate parameterized routes correctly', () => {
    expect(routes.blog.category('tech')).toBe('/blog/tech');
    expect(routes.blog.article('tech', 'saas-architecture')).toBe(
      '/blog/tech/saas-architecture',
    );
    expect(routes.salons.city('riyadh')).toBe('/salons/city/riyadh');
    expect(routes.salons.profile('salon-1')).toBe('/salons/salon-1');
  });
});

