import 'server-only';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '../index';
import { firestorePaths } from '../../paths';
import {
  CompanyProfileDocSchema,
  TaxSettingsDocSchema,
  GeneralSettingsDocSchema,
  SeoSettingsDocSchema,
  type CompanyProfileDoc,
  type TaxSettingsDoc,
  type GeneralSettingsDoc,
  type SeoSettingsDoc,
} from '../../company.schema';

export class CompanyRepository {
  private readonly db: Firestore;

  constructor(firestore?: Firestore) {
    this.db = firestore || getFirebaseAdminFirestore();
  }

  // ==========================================
  // Company Profile Settings
  // ==========================================

  async getCompanyProfile(tenantId: string): Promise<CompanyProfileDoc | null> {
    const snap = await this.db.doc(firestorePaths.companyProfile(tenantId)).get();
    if (!snap.exists) {
      return null;
    }
    return CompanyProfileDocSchema.parse(snap.data());
  }

  async saveCompanyProfile(
    tenantId: string,
    input: Partial<CompanyProfileDoc> & { legalNameAr: string; legalForm: any }
  ): Promise<CompanyProfileDoc> {
    const existing = await this.getCompanyProfile(tenantId);
    const nowIso = new Date().toISOString();

    const data: CompanyProfileDoc = CompanyProfileDocSchema.parse({
      tenantId,
      ...existing,
      ...input,
      createdAt: existing?.createdAt || nowIso,
      updatedAt: nowIso,
    });

    await this.db.doc(firestorePaths.companyProfile(tenantId)).set(data);
    return data;
  }

  // ==========================================
  // Tax Settings (Saudi VAT)
  // ==========================================

  async getTaxSettings(tenantId: string): Promise<TaxSettingsDoc | null> {
    const snap = await this.db.doc(firestorePaths.taxSettings(tenantId)).get();
    if (!snap.exists) {
      return null;
    }
    return TaxSettingsDocSchema.parse(snap.data());
  }

  async saveTaxSettings(
    tenantId: string,
    input: Partial<TaxSettingsDoc> & { vatStatus: any }
  ): Promise<TaxSettingsDoc> {
    const existing = await this.getTaxSettings(tenantId);
    const nowIso = new Date().toISOString();

    const data: TaxSettingsDoc = TaxSettingsDocSchema.parse({
      tenantId,
      standardVatRateBps: 1500, // 15% standard rate
      isTaxInclusivePricing: true,
      ...existing,
      ...input,
      vatNumber: input.vatNumber !== undefined ? (input.vatNumber || null) : (existing?.vatNumber || null),
      createdAt: existing?.createdAt || nowIso,
      updatedAt: nowIso,
    });

    await this.db.doc(firestorePaths.taxSettings(tenantId)).set(data);
    return data;
  }

  // ==========================================
  // General Settings
  // ==========================================

  async getGeneralSettings(tenantId: string): Promise<GeneralSettingsDoc | null> {
    const snap = await this.db.doc(firestorePaths.generalSettings(tenantId)).get();
    if (!snap.exists) {
      return null;
    }
    return GeneralSettingsDocSchema.parse(snap.data());
  }

  async saveGeneralSettings(
    tenantId: string,
    input: Partial<GeneralSettingsDoc>
  ): Promise<GeneralSettingsDoc> {
    const existing = await this.getGeneralSettings(tenantId);
    const nowIso = new Date().toISOString();

    const data: GeneralSettingsDoc = GeneralSettingsDocSchema.parse({
      tenantId,
      baseCurrency: 'SAR',
      minorUnitName: 'Halalas',
      minorUnitRatio: 100,
      timezone: 'Asia/Riyadh',
      defaultLocale: 'ar-SA',
      calendarType: 'GREGORIAN',
      startOfWeek: 'SUNDAY',
      ...existing,
      ...input,
      createdAt: existing?.createdAt || nowIso,
      updatedAt: nowIso,
    });

    await this.db.doc(firestorePaths.generalSettings(tenantId)).set(data);
    return data;
  }

  // ==========================================
  // SEO & Public Profile Settings
  // ==========================================

  async getSeoSettings(tenantId: string): Promise<SeoSettingsDoc | null> {
    const snap = await this.db.doc(firestorePaths.seoSettings(tenantId)).get();
    if (!snap.exists) {
      return null;
    }
    return SeoSettingsDocSchema.parse(snap.data());
  }

  async saveSeoSettings(
    tenantId: string,
    input: Partial<SeoSettingsDoc> & { siteTitle: string; siteDescription: string }
  ): Promise<SeoSettingsDoc> {
    const existing = await this.getSeoSettings(tenantId);
    const nowIso = new Date().toISOString();

    const data: SeoSettingsDoc = SeoSettingsDocSchema.parse({
      tenantId,
      indexingEnabled: false,
      keywords: [],
      ...existing,
      ...input,
      createdAt: existing?.createdAt || nowIso,
      updatedAt: nowIso,
    });

    await this.db.doc(firestorePaths.seoSettings(tenantId)).set(data);
    return data;
  }
}

