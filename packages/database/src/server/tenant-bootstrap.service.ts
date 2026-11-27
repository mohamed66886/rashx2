import 'server-only';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from './index';
import { firestorePaths } from '../paths';
import {
  BranchDocSchema,
  PublicBranchSchema,
  MainBranchPointerDocSchema,
} from '../branch.schema';
import {
  CompanyProfileDocSchema,
  TaxSettingsDocSchema,
  GeneralSettingsDocSchema,
  SeoSettingsDocSchema,
  BootstrapStatusDocSchema,
  type BootstrapStatusDoc,
} from '../company.schema';
import {
  AccountDocSchema,
  AccountingSettingsDocSchema,
  FiscalYearDocSchema,
  AccountingPeriodDocSchema,
  AccountBalanceDocSchema,
} from '../accounting.schema';
import { DEFAULT_SAUDI_ACCOUNTS } from '../default-chart-of-accounts';
import { DEFAULT_OPERATING_HOURS } from './repositories/branch.repository';

export interface BootstrapOptions {
  name: string;
  ownerUid: string;
  crNumber?: string | null;
  vatNumber?: string | null;
  billingEmail?: string | null;
  nowIso?: string;
  fiscalYearStartMonth?: number;
}

export interface ReconciliationResult {
  tenantId: string;
  mainBranchCreated: boolean;
  companySettingsCreated: boolean;
  taxSettingsCreated: boolean;
  generalSettingsCreated: boolean;
  seoSettingsCreated: boolean;
  accountingSettingsCreated: boolean;
  fiscalYearCreated: boolean;
  periodsCreatedCount: number;
  accountsCreatedCount: number;
  bootstrapStatus: BootstrapStatusDoc;
}

export interface GeneratedFiscalPeriod {
  periodNumber: number;
  id: string;
  nameAr: string;
  nameEn: string;
  startDate: string;
  endDate: string;
}

/**
 * Generates 12 contiguous, non-overlapping monthly accounting periods.
 * Accurately supports calendar-year (Jan-Dec) and non-calendar (e.g. Apr-Mar) configurations,
 * multi-year spans, and leap years (e.g. Feb 29).
 */
export function generateFiscalPeriods(
  startYear: number,
  startMonth: number = 1
): {
  fiscalStartDate: string;
  fiscalEndDate: string;
  periods: GeneratedFiscalPeriod[];
} {
  const monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ];
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const periods: GeneratedFiscalPeriod[] = [];
  let currentY = startYear;
  let currentM = Math.max(1, Math.min(12, startMonth));

  for (let p = 1; p <= 12; p++) {
    const yearStr = String(currentY);
    const monthStr = String(currentM).padStart(2, '0');
    // Last day of month using UTC date boundaries (proper leap year handling)
    const lastDay = new Date(Date.UTC(currentY, currentM, 0)).getUTCDate();
    const lastDayStr = String(lastDay).padStart(2, '0');

    const startDate = `${yearStr}-${monthStr}-01`;
    const endDate = `${yearStr}-${monthStr}-${lastDayStr}`;
    const periodId = `${yearStr}-${monthStr}`;

    periods.push({
      periodNumber: p,
      id: periodId,
      nameAr: `${monthNamesAr[currentM - 1]} ${currentY}`,
      nameEn: `${monthNamesEn[currentM - 1]} ${currentY}`,
      startDate,
      endDate,
    });

    currentM++;
    if (currentM > 12) {
      currentM = 1;
      currentY++;
    }
  }

  return {
    fiscalStartDate: periods[0]!.startDate,
    fiscalEndDate: periods[11]!.endDate,
    periods,
  };
}

export class TenantBootstrapService {
  private readonly db: Firestore;

  constructor(firestore?: Firestore) {
    this.db = firestore || getFirebaseAdminFirestore();
    try {
      this.db.settings({ ignoreUndefinedProperties: true });
    } catch {
      // In case settings were already initialized or frozen
    }
  }

  /**
   * Retrieves current bootstrap status for a tenant.
   */
  async getBootstrapStatus(tenantId: string): Promise<BootstrapStatusDoc | null> {
    const snap = await this.db.doc(firestorePaths.bootstrapStatus(tenantId)).get();
    if (!snap.exists) {
      return null;
    }
    return BootstrapStatusDocSchema.parse(snap.data());
  }

  /**
   * Orchestrates the complete tenant bootstrap foundation:
   * 1. Lifecycle status document (`/settings/bootstrap` -> INITIALIZING)
   * 2. Batch 1: Main branch (`isMain: true`), public branch, main mutex pointer, company, tax, general, SEO, accounting settings, fiscal year
   * 3. Batch 2: 12 Contiguous Accounting Periods (with leap year and configurable start month support)
   * 4. Batch 3: Chart of accounts (35 accounts) & zero balances (22 posting accounts)
   * 5. Lifecycle status transition to READY
   */
  async bootstrapTenant(tenantId: string, options: BootstrapOptions): Promise<void> {
    const nowIso = options.nowIso || new Date().toISOString();
    const currentYear = new Date(nowIso).getFullYear();
    const startMonth = options.fiscalYearStartMonth || 1;
    const bootstrapRef = this.db.doc(firestorePaths.bootstrapStatus(tenantId));

    // Initialize lifecycle state document
    const initialStatus: BootstrapStatusDoc = BootstrapStatusDocSchema.parse({
      tenantId,
      status: 'INITIALIZING',
      stage: 'INITIALIZING',
      version: 1,
      startedAt: nowIso,
      completedAt: null,
      lastError: null,
      retryCount: 0,
      updatedAt: nowIso,
    });
    await bootstrapRef.set(initialStatus);

    try {
      // -------------------------------------------------------------
      // Batch 1: Branches, Main Mutex Pointer & Core Settings
      // -------------------------------------------------------------
      const batch1 = this.db.batch();

      // 1. Main Branch
      const branchId = 'main-branch';
      const mainBranch = BranchDocSchema.parse({
        id: branchId,
        tenantId,
        name: `${options.name} - الفرع الرئيسي`,
        nameEn: `${options.name} - Main Branch`,
        code: 'MAIN',
        isMain: true,
        city: 'الرياض',
        district: 'العليا',
        region: 'منطقة الرياض',
        country: 'SA',
        address: 'طريق الملك فهد',
        coordinates: { latitude: 24.7136, longitude: 46.6753 },
        phone: '+966500000000',
        isActive: true,
        operatingHours: DEFAULT_OPERATING_HOURS,
        internalNotes: 'الفرع الرئيسي التأسيسي للمنشأة',
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      batch1.set(this.db.doc(firestorePaths.branch(tenantId, branchId)), mainBranch);

      const publicBranch = PublicBranchSchema.parse({
        id: branchId,
        name: mainBranch.name,
        nameEn: mainBranch.nameEn,
        isMain: true,
        city: mainBranch.city,
        district: mainBranch.district,
        region: mainBranch.region,
        country: mainBranch.country,
        address: mainBranch.address,
        coordinates: mainBranch.coordinates,
        phone: mainBranch.phone,
        operatingHours: mainBranch.operatingHours,
        isActive: true,
      });
      batch1.set(this.db.doc(firestorePaths.publicBranch(tenantId, branchId)), publicBranch);

      // Main Branch Pointer Mutex
      const mainBranchPointer = MainBranchPointerDocSchema.parse({
        tenantId,
        mainBranchId: branchId,
        updatedAt: nowIso,
        version: 1,
      });
      batch1.set(this.db.doc(firestorePaths.mainBranchPointer(tenantId)), mainBranchPointer);

      // 2. Company Profile Settings
      const companyProfile = CompanyProfileDocSchema.parse({
        tenantId,
        legalNameAr: options.name,
        legalNameEn: options.name,
        legalForm: 'SOLE_PROPRIETORSHIP',
        crNumber: options.crNumber || '1010000000',
        nationalAddress: {
          buildingNumber: '1234',
          streetName: 'طريق الملك فهد',
          district: 'العليا',
          city: 'الرياض',
          postalCode: '12211',
        },
        phone: '+966500000000',
        email: options.billingEmail || 'salon@rashx.org',
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      batch1.set(this.db.doc(firestorePaths.companyProfile(tenantId)), companyProfile);

      // 3. Tax Settings
      const taxSettings = TaxSettingsDocSchema.parse({
        tenantId,
        vatStatus: options.vatNumber ? 'REGISTERED' : 'NOT_REGISTERED',
        vatNumber: options.vatNumber || null,
        standardVatRateBps: 1500, // 15% standard rate
        rates: [
          {
            rateBps: 1500,
            nameAr: 'النسبة الأساسية القياسية',
            effectiveFrom: '2020-07-01',
            effectiveUntil: null,
          },
        ],
        isTaxInclusivePricing: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      batch1.set(this.db.doc(firestorePaths.taxSettings(tenantId)), taxSettings);

      // 4. General Settings
      const generalSettings = GeneralSettingsDocSchema.parse({
        tenantId,
        baseCurrency: 'SAR',
        minorUnitName: 'Halalas',
        minorUnitRatio: 100,
        timezone: 'Asia/Riyadh',
        defaultLocale: 'ar-SA',
        calendarType: 'GREGORIAN',
        startOfWeek: 'SUNDAY',
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      batch1.set(this.db.doc(firestorePaths.generalSettings(tenantId)), generalSettings);

      // 5. SEO Settings
      const seoSettings = SeoSettingsDocSchema.parse({
        tenantId,
        siteTitle: options.name,
        siteDescription: `صالون ${options.name} - حجز مواعيد وخدمات التجميل والعناية`,
        indexingEnabled: false,
        keywords: ['صالون', 'تجميل', 'عناية', options.name],
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      batch1.set(this.db.doc(firestorePaths.seoSettings(tenantId)), seoSettings);

      // 6. Accounting Settings
      const accountingSettings = AccountingSettingsDocSchema.parse({
        tenantId,
        baseCurrency: 'SAR',
        fiscalYearStartMonth: startMonth,
        accountingMethod: 'ACCRUAL',
        retainedEarningsAccountId: 'account-3030',
        vatPayableAccountId: 'account-2040',
        vatReceivableAccountId: 'account-1050',
        lockoutDate: null,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      batch1.set(this.db.doc(firestorePaths.accountingSettings(tenantId)), accountingSettings);

      // 7. Fiscal Year
      const generated = generateFiscalPeriods(currentYear, startMonth);
      const fiscalYearId = `FY-${currentYear}`;
      const fiscalYear = FiscalYearDocSchema.parse({
        id: fiscalYearId,
        tenantId,
        name: `السنة المالية ${currentYear}`,
        startDate: generated.fiscalStartDate,
        endDate: generated.fiscalEndDate,
        status: 'OPEN',
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      batch1.set(this.db.doc(firestorePaths.fiscalYear(tenantId, fiscalYearId)), fiscalYear);

      await batch1.commit();

      // Transition to Stage 2
      await bootstrapRef.update({
        stage: 'BRANCH_AND_SETTINGS_CREATED',
        updatedAt: new Date().toISOString(),
      });

      // -------------------------------------------------------------
      // Batch 2: 12 Accounting Periods
      // -------------------------------------------------------------
      const batch2 = this.db.batch();
      for (const p of generated.periods) {
        const period = AccountingPeriodDocSchema.parse({
          id: p.id,
          tenantId,
          fiscalYearId,
          periodNumber: p.periodNumber,
          nameAr: p.nameAr,
          nameEn: p.nameEn,
          startDate: p.startDate,
          endDate: p.endDate,
          status: 'OPEN',
          createdAt: nowIso,
          updatedAt: nowIso,
        });
        batch2.set(this.db.doc(firestorePaths.accountingPeriod(tenantId, p.id)), period);
      }
      await batch2.commit();

      // Transition to Stage 3
      await bootstrapRef.update({
        stage: 'PERIODS_CREATED',
        updatedAt: new Date().toISOString(),
      });

      // -------------------------------------------------------------
      // Batch 3: Chart of Accounts & Zero Balances
      // -------------------------------------------------------------
      const batch3 = this.db.batch();
      for (const accDef of DEFAULT_SAUDI_ACCOUNTS) {
        const accId = `account-${accDef.code}`;
        const parentId = accDef.parentCode ? `account-${accDef.parentCode}` : null;
        const accountDoc = AccountDocSchema.parse({
          id: accId,
          tenantId,
          code: accDef.code,
          nameAr: accDef.nameAr,
          nameEn: accDef.nameEn,
          type: accDef.type,
          normalBalance: accDef.normalBalance,
          isPosting: accDef.isPosting,
          isSystem: true,
          parentAccountId: parentId,
          accountLevel: accDef.accountLevel,
          description: accDef.description,
          isActive: true,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
        batch3.set(this.db.doc(firestorePaths.account(tenantId, accId)), accountDoc);

        if (accDef.isPosting) {
          const balanceDoc = AccountBalanceDocSchema.parse({
            id: accId,
            tenantId,
            accountId: accId,
            accountCode: accDef.code,
            accountNameAr: accDef.nameAr,
            accountType: accDef.type,
            normalBalance: accDef.normalBalance,
            totalDebitHalalas: 0,
            totalCreditHalalas: 0,
            netBalanceHalalas: 0,
            lastPostedAt: null,
            lastJournalEntryId: null,
            updatedAt: nowIso,
          });
          batch3.set(this.db.doc(firestorePaths.accountBalance(tenantId, accId)), balanceDoc);
        }
      }
      await batch3.commit();

      // Final transition to READY
      const completedIso = new Date().toISOString();
      const readyStatus: BootstrapStatusDoc = BootstrapStatusDocSchema.parse({
        tenantId,
        status: 'READY',
        stage: 'READY',
        version: 2,
        startedAt: nowIso,
        completedAt: completedIso,
        lastError: null,
        retryCount: 0,
        updatedAt: completedIso,
      });
      await bootstrapRef.set(readyStatus);
    } catch (err: any) {
      const failedIso = new Date().toISOString();
      await bootstrapRef.set(
        BootstrapStatusDocSchema.parse({
          tenantId,
          status: 'FAILED',
          stage: 'FAILED',
          version: 2,
          startedAt: nowIso,
          completedAt: null,
          lastError: err?.message || String(err),
          retryCount: 0,
          updatedAt: failedIso,
        })
      );
      throw err;
    }
  }

  /**
   * Idempotently reconciles an existing or partially provisioned tenant.
   * Creates missing foundational records without overwriting existing data.
   * Concurrency-safe: if status is already READY, immediately returns without modifying records.
   */
  async reconcileTenant(tenantId: string): Promise<ReconciliationResult> {
    const nowIso = new Date().toISOString();
    const currentYear = new Date().getFullYear();
    const bootstrapRef = this.db.doc(firestorePaths.bootstrapStatus(tenantId));

    // Check existing bootstrap status
    const currentStatusSnap = await bootstrapRef.get();
    if (currentStatusSnap.exists) {
      const currentStatus = BootstrapStatusDocSchema.parse(currentStatusSnap.data());
      if (currentStatus.status === 'READY') {
        return {
          tenantId,
          mainBranchCreated: false,
          companySettingsCreated: false,
          taxSettingsCreated: false,
          generalSettingsCreated: false,
          seoSettingsCreated: false,
          accountingSettingsCreated: false,
          fiscalYearCreated: false,
          periodsCreatedCount: 0,
          accountsCreatedCount: 0,
          bootstrapStatus: currentStatus,
        };
      }
    }

    // 1. Fetch tenant doc to extract name and details
    const tenantSnap = await this.db.doc(firestorePaths.tenant(tenantId)).get();
    if (!tenantSnap.exists) {
      throw new Error(`Tenant '${tenantId}' does not exist.`);
    }
    const tenantData = tenantSnap.data() as any;
    const tenantName = tenantData?.name || tenantData?.commercialName || 'المنشأة';

    const result: ReconciliationResult = {
      tenantId,
      mainBranchCreated: false,
      companySettingsCreated: false,
      taxSettingsCreated: false,
      generalSettingsCreated: false,
      seoSettingsCreated: false,
      accountingSettingsCreated: false,
      fiscalYearCreated: false,
      periodsCreatedCount: 0,
      accountsCreatedCount: 0,
      bootstrapStatus: null as any,
    };

    // Check Main Branch & Pointer
    const pointerRef = this.db.doc(firestorePaths.mainBranchPointer(tenantId));
    const pointerSnap = await pointerRef.get();

    const branchesSnap = await this.db
      .collection(firestorePaths.branches(tenantId))
      .where('isMain', '==', true)
      .limit(1)
      .get();

    if (branchesSnap.empty) {
      const branchId = 'main-branch';
      const mainBranch = BranchDocSchema.parse({
        id: branchId,
        tenantId,
        name: `${tenantName} - الفرع الرئيسي`,
        nameEn: `${tenantName} - Main Branch`,
        code: 'MAIN',
        isMain: true,
        city: 'الرياض',
        district: 'العليا',
        region: 'منطقة الرياض',
        country: 'SA',
        address: 'طريق الملك فهد',
        coordinates: { latitude: 24.7136, longitude: 46.6753 },
        phone: '+966500000000',
        isActive: true,
        operatingHours: DEFAULT_OPERATING_HOURS,
        internalNotes: 'الفرع الرئيسي التأسيسي للمنشأة',
        createdAt: nowIso,
        updatedAt: nowIso,
      });

      const publicBranch = PublicBranchSchema.parse({
        id: branchId,
        name: mainBranch.name,
        nameEn: mainBranch.nameEn,
        isMain: true,
        city: mainBranch.city,
        district: mainBranch.district,
        region: mainBranch.region,
        country: mainBranch.country,
        address: mainBranch.address,
        coordinates: mainBranch.coordinates,
        phone: mainBranch.phone,
        operatingHours: mainBranch.operatingHours,
        isActive: true,
      });

      const batch = this.db.batch();
      batch.set(this.db.doc(firestorePaths.branch(tenantId, branchId)), mainBranch);
      batch.set(this.db.doc(firestorePaths.publicBranch(tenantId, branchId)), publicBranch);
      batch.set(pointerRef, {
        tenantId,
        mainBranchId: branchId,
        updatedAt: nowIso,
        version: 1,
      });
      await batch.commit();
      result.mainBranchCreated = true;
    } else if (!pointerSnap.exists) {
      // Heal pointer if main branch exists but pointer document was missing
      const existingMainBranchId = branchesSnap.docs[0]!.id;
      await pointerRef.set({
        tenantId,
        mainBranchId: existingMainBranchId,
        updatedAt: nowIso,
        version: 1,
      });
    }

    // Check Company Settings
    const compSnap = await this.db.doc(firestorePaths.companyProfile(tenantId)).get();
    if (!compSnap.exists) {
      const companyProfile = CompanyProfileDocSchema.parse({
        tenantId,
        legalNameAr: tenantName,
        legalNameEn: tenantName,
        legalForm: 'SOLE_PROPRIETORSHIP',
        crNumber: tenantData?.crNumber || '1010000000',
        nationalAddress: {
          buildingNumber: '1234',
          streetName: 'طريق الملك فهد',
          district: 'العليا',
          city: 'الرياض',
          postalCode: '12211',
        },
        phone: '+966500000000',
        email: tenantData?.billingEmail || 'salon@rashx.org',
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      await this.db.doc(firestorePaths.companyProfile(tenantId)).set(companyProfile);
      result.companySettingsCreated = true;
    }

    // Check Tax Settings
    const taxSnap = await this.db.doc(firestorePaths.taxSettings(tenantId)).get();
    if (!taxSnap.exists) {
      const taxSettings = TaxSettingsDocSchema.parse({
        tenantId,
        vatStatus: tenantData?.vatNumber ? 'REGISTERED' : 'NOT_REGISTERED',
        vatNumber: tenantData?.vatNumber || null,
        standardVatRateBps: 1500,
        rates: [
          {
            rateBps: 1500,
            nameAr: 'النسبة الأساسية القياسية',
            effectiveFrom: '2020-07-01',
            effectiveUntil: null,
          },
        ],
        isTaxInclusivePricing: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      await this.db.doc(firestorePaths.taxSettings(tenantId)).set(taxSettings);
      result.taxSettingsCreated = true;
    }

    // Check General Settings
    const genSnap = await this.db.doc(firestorePaths.generalSettings(tenantId)).get();
    if (!genSnap.exists) {
      const generalSettings = GeneralSettingsDocSchema.parse({
        tenantId,
        baseCurrency: 'SAR',
        minorUnitName: 'Halalas',
        minorUnitRatio: 100,
        timezone: 'Asia/Riyadh',
        defaultLocale: 'ar-SA',
        calendarType: 'GREGORIAN',
        startOfWeek: 'SUNDAY',
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      await this.db.doc(firestorePaths.generalSettings(tenantId)).set(generalSettings);
      result.generalSettingsCreated = true;
    }

    // Check SEO Settings
    const seoSnap = await this.db.doc(firestorePaths.seoSettings(tenantId)).get();
    if (!seoSnap.exists) {
      const seoSettings = SeoSettingsDocSchema.parse({
        tenantId,
        siteTitle: tenantName,
        siteDescription: `صالون ${tenantName} - حجز مواعيد وخدمات التجميل والعناية`,
        indexingEnabled: false,
        keywords: ['صالون', 'تجميل', 'عناية', tenantName],
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      await this.db.doc(firestorePaths.seoSettings(tenantId)).set(seoSettings);
      result.seoSettingsCreated = true;
    }

    // Check Accounting Settings
    const accSettingsSnap = await this.db.doc(firestorePaths.accountingSettings(tenantId)).get();
    let fiscalYearStartMonth = 1;
    if (!accSettingsSnap.exists) {
      const accountingSettings = AccountingSettingsDocSchema.parse({
        tenantId,
        baseCurrency: 'SAR',
        fiscalYearStartMonth: 1,
        accountingMethod: 'ACCRUAL',
        retainedEarningsAccountId: 'account-3030',
        vatPayableAccountId: 'account-2040',
        vatReceivableAccountId: 'account-1050',
        lockoutDate: null,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      await this.db.doc(firestorePaths.accountingSettings(tenantId)).set(accountingSettings);
      result.accountingSettingsCreated = true;
    } else {
      fiscalYearStartMonth = accSettingsSnap.data()?.fiscalYearStartMonth || 1;
    }

    // Check Fiscal Year & Periods
    const fiscalYearId = `FY-${currentYear}`;
    const fySnap = await this.db.doc(firestorePaths.fiscalYear(tenantId, fiscalYearId)).get();
    const generated = generateFiscalPeriods(currentYear, fiscalYearStartMonth);

    if (!fySnap.exists) {
      const fiscalYear = FiscalYearDocSchema.parse({
        id: fiscalYearId,
        tenantId,
        name: `السنة المالية ${currentYear}`,
        startDate: generated.fiscalStartDate,
        endDate: generated.fiscalEndDate,
        status: 'OPEN',
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      await this.db.doc(firestorePaths.fiscalYear(tenantId, fiscalYearId)).set(fiscalYear);
      result.fiscalYearCreated = true;
    }

    // Check Periods
    const existingPeriodsSnap = await this.db.collection(firestorePaths.accountingPeriods(tenantId)).get();
    if (existingPeriodsSnap.empty) {
      const batchPeriods = this.db.batch();
      for (const p of generated.periods) {
        const period = AccountingPeriodDocSchema.parse({
          id: p.id,
          tenantId,
          fiscalYearId,
          periodNumber: p.periodNumber,
          nameAr: p.nameAr,
          nameEn: p.nameEn,
          startDate: p.startDate,
          endDate: p.endDate,
          status: 'OPEN',
          createdAt: nowIso,
          updatedAt: nowIso,
        });
        batchPeriods.set(this.db.doc(firestorePaths.accountingPeriod(tenantId, p.id)), period);
      }
      await batchPeriods.commit();
      result.periodsCreatedCount = 12;
    }

    // Check Accounts
    const accountsSnap = await this.db.collection(firestorePaths.accounts(tenantId)).get();
    if (accountsSnap.empty) {
      const batchAcc = this.db.batch();
      for (const accDef of DEFAULT_SAUDI_ACCOUNTS) {
        const accId = `account-${accDef.code}`;
        const parentId = accDef.parentCode ? `account-${accDef.parentCode}` : null;
        const accountDoc = AccountDocSchema.parse({
          id: accId,
          tenantId,
          code: accDef.code,
          nameAr: accDef.nameAr,
          nameEn: accDef.nameEn,
          type: accDef.type,
          normalBalance: accDef.normalBalance,
          isPosting: accDef.isPosting,
          isSystem: true,
          parentAccountId: parentId,
          accountLevel: accDef.accountLevel,
          description: accDef.description,
          isActive: true,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
        batchAcc.set(this.db.doc(firestorePaths.account(tenantId, accId)), accountDoc);

        if (accDef.isPosting) {
          const balanceDoc = AccountBalanceDocSchema.parse({
            id: accId,
            tenantId,
            accountId: accId,
            accountCode: accDef.code,
            accountNameAr: accDef.nameAr,
            accountType: accDef.type,
            normalBalance: accDef.normalBalance,
            totalDebitHalalas: 0,
            totalCreditHalalas: 0,
            netBalanceHalalas: 0,
            lastPostedAt: null,
            lastJournalEntryId: null,
            updatedAt: nowIso,
          });
          batchAcc.set(this.db.doc(firestorePaths.accountBalance(tenantId, accId)), balanceDoc);
        }
      }
      await batchAcc.commit();
      result.accountsCreatedCount = DEFAULT_SAUDI_ACCOUNTS.length;
    }

    // Mark lifecycle status READY
    const finalStatus: BootstrapStatusDoc = BootstrapStatusDocSchema.parse({
      tenantId,
      status: 'READY',
      stage: 'READY',
      version: (currentStatusSnap.data()?.version || 0) + 1,
      startedAt: currentStatusSnap.data()?.startedAt || nowIso,
      completedAt: nowIso,
      lastError: null,
      retryCount: (currentStatusSnap.data()?.retryCount || 0) + 1,
      updatedAt: nowIso,
    });
    await bootstrapRef.set(finalStatus);
    result.bootstrapStatus = finalStatus;

    return result;
  }
}
