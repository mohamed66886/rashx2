/**
 * @rashx/database
 *
 * Core database abstractions, path builders, and typed reference helpers.
 *
 * Subpath entrypoints:
 * - `@rashx/database/client`: Modular Firestore client instances ('use client' safe)
 * - `@rashx/database/server`: Admin Firestore instances ('server-only' enforced)
 */

export * from './paths';
export * from './types';
export * from './hostname';

// Multi-tenant domain schemas & projections
export * from './user.schema';
export * from './slug.schema';
export * from './tenant.schema';
export * from './membership.schema';
export * from './branch.schema';
export * from './staff.schema';
export * from './service.schema';
export * from './appointment.schema';
export * from './certificate-validation';
export * from './subscription.schema';
export * from './company.schema';
export * from './accounting.schema';
export * from './default-chart-of-accounts';
export * from './permissions';

// Phase 2: Employees, Providers, Compensation & Commission Policies
export * from './employee.schema';
export * from './provider.schema';
export * from './compensation.schema';
export * from './commission-policy.schema';
export * from './invitation.schema';
export * from './hr-audit.schema';

// Phase 3: Service Catalog, Categories, Pricing & Commission Integration
export * from './service-category.schema';
export * from './service-pricing';
export * from './service-audit.schema';

// Phase 4: Customer Management & Core Booking Engine
export * from './customer.schema';
export * from './booking.schema';
export * from './availability.types';

// Phase 4.1: Salon Daily Operations Engine (Resources, Queue, Calling, Walk-ins)
export * from './resource.schema';
export * from './queue.schema';

// Phase 4.2: POS, Invoicing & Payment Management
export * from './pos.schema';

// Phase 4.3: Inventory, Suppliers & Purchasing Management
export * from './inventory.schema';

export const DATABASE_PACKAGE_INITIALIZED = true as const;
