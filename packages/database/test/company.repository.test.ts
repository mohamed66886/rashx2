import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { CompanyRepository } from '../src/server/repositories/company.repository';
import { firestorePaths } from '../src/paths';

class MockCompanyFirestore {
  public store = new Map<string, Record<string, unknown>>();

  doc(path: string): DocumentReference {
    return {
      id: path.split('/').pop()!,
      path,
      get: async () => this.createSnapshot(path),
      set: async (data: Record<string, unknown>) => {
        this.store.set(path, JSON.parse(JSON.stringify(data)));
      },
    } as unknown as DocumentReference;
  }

  private createSnapshot(path: string): DocumentSnapshot {
    const exists = this.store.has(path);
    const data = exists ? JSON.parse(JSON.stringify(this.store.get(path))) : undefined;
    return {
      id: path.split('/').pop()!,
      ref: this.doc(path),
      exists,
      data: () => data,
    } as unknown as DocumentSnapshot;
  }
}

describe('CompanyRepository Suite', () => {
  let mockDb: MockCompanyFirestore;
  let repo: CompanyRepository;
  const tenantId = 'tenant_company_test';

  beforeEach(() => {
    mockDb = new MockCompanyFirestore();
    repo = new CompanyRepository(mockDb as unknown as Firestore);
  });

  it('saves and retrieves company profile with Saudi SPL national address & 700 number', async () => {
    const profile = await repo.saveCompanyProfile(tenantId, {
      legalNameAr: 'شركة صالون الجمال المحدودة',
      legalNameEn: 'Beauty Salon LLC',
      legalForm: 'LLC',
      crNumber: '1010123456',
      unifiedEstablishmentNumber: '7001234567',
      phone: '+966501234567',
      email: 'legal@beauty.sa',
      nationalAddress: {
        buildingNumber: '7890',
        streetName: 'طريق التخصصي',
        district: 'المعذر الشمالي',
        city: 'الرياض',
        postalCode: '12314',
        additionalNumber: '1234',
        unitNumber: '5',
      },
    });

    expect(profile.legalNameAr).toBe('شركة صالون الجمال المحدودة');
    expect(profile.unifiedEstablishmentNumber).toBe('7001234567');
    expect(profile.nationalAddress.city).toBe('الرياض');

    const fetched = await repo.getCompanyProfile(tenantId);
    expect(fetched).not.toBeNull();
    expect(fetched?.crNumber).toBe('1010123456');
  });

  it('saves and validates Saudi VAT tax settings with 1500 bps standard rate', async () => {
    const tax = await repo.saveTaxSettings(tenantId, {
      vatStatus: 'REGISTERED',
      vatNumber: '300123456789003',
      isTaxInclusivePricing: true,
    });

    expect(tax.vatStatus).toBe('REGISTERED');
    expect(tax.vatNumber).toBe('300123456789003');
    expect(tax.standardVatRateBps).toBe(1500);

    const fetched = await repo.getTaxSettings(tenantId);
    expect(fetched?.isTaxInclusivePricing).toBe(true);
  });

  it('saves and retrieves general operating settings', async () => {
    const settings = await repo.saveGeneralSettings(tenantId, {
      timezone: 'Asia/Riyadh',
      defaultLocale: 'ar-SA',
      startOfWeek: 'SUNDAY',
      calendarType: 'GREGORIAN',
    });

    expect(settings.baseCurrency).toBe('SAR');
    expect(settings.minorUnitRatio).toBe(100);
    expect(settings.timezone).toBe('Asia/Riyadh');
  });

  it('saves and retrieves SEO settings without sensitive data', async () => {
    const seo = await repo.saveSeoSettings(tenantId, {
      siteTitle: 'صالون الجمال الراقي',
      siteDescription: 'أفضل خدمات التجميل والعناية بالرياض',
      keywords: ['صالون', 'تجميل', 'الرياض'],
      indexingEnabled: true,
    });

    expect(seo.siteTitle).toBe('صالون الجمال الراقي');
    expect(seo.indexingEnabled).toBe(true);
    // Ensure no tax or legal numbers leak into SEO doc
    expect((seo as any).crNumber).toBeUndefined();
    expect((seo as any).vatNumber).toBeUndefined();
  });
});

