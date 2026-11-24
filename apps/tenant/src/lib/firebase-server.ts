import 'server-only';

export {
  getFirebaseAdminApp,
  getFirebaseAdminAuth,
  verifyIdToken,
  verifySessionCookie,
  createSessionCookie,
  revokeRefreshTokens,
} from '@rashx/auth/server';

export {
  getFirebaseAdminFirestore,
  getTypedAdminCollection,
  getTypedAdminDoc,
  firestorePaths,
  getTenantResolver,
  TenantResolver,
  MembershipRepository,
  SubscriptionRepository,
  SubscriptionAccessGuard,
  BranchRepository,
  CompanyRepository,
  AccountingRepository,
  EmployeeRepository,
  ProviderRepository,
  CompensationRepository,
  CommissionPolicyRepository,
  InvitationRepository,
  ServiceCategoryRepository,
  ServiceRepository,
  TenantBootstrapService,
  type TenantContext,
  type TenantResolutionOutcome,
} from '@rashx/database/server';

export {
  evaluateSubscriptionStatus,
  canViewCompensation,
  canManageCompensation,
  canTerminateEmployee,
  canManageServiceCommission,
  canManageServicePricing,
  canManageServiceStatus,
  hasPermission,
  type SubscriptionDoc,
  type SubscriptionStatus,
  type SubscriptionAccessEvaluation,
  type EmployeeDoc,
  type ProviderDoc,
  type CompensationRecordDoc,
  type CommissionPolicyDoc,
  type InvitationDoc,
  type ServiceDoc,
  type ServiceCategoryDoc,
} from '@rashx/database';

