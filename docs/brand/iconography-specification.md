# RASHX Iconography Specification

> **Status:** Specification Draft · **Date:** 2026-11-18 · **Package:** `@rashx/icons`

---

## 1. Icon Architecture Overview

Iconography in RASHX is divided strictly into two tiers:
1. **Proprietary Brand Marks (`@rashx/icons/brand`)**: Custom SVG components representing RASHX's visual identity.
2. **Interface Icons (`@rashx/icons/interface`)**: Curated, domain-grouped Lucide React icons with uniform stroke width, optical alignment, and explicit RTL behavior.

```
@rashx/icons/
├── src/
│   ├── brand/               ← Proprietary SVG marks
│   │   ├── RashxSymbol.tsx
│   │   ├── RashxMonogram.tsx
│   │   ├── RashxWordmark.tsx
│   │   └── index.ts
│   └── interface/           ← Categorized Lucide interface icons
│       ├── navigation.ts
│       ├── corporate.ts
│       ├── product.ts
│       ├── hr.ts
│       ├── crm.ts
│       ├── booking.ts
│       ├── sales.ts
│       ├── inventory.ts
│       ├── analytics.ts
│       ├── industries.ts
│       ├── security.ts
│       ├── social.ts
│       ├── status.ts
│       └── index.ts
```

---

## 2. Standardization Rules

### 2.1 Optical Sizing & Stroke Weights

| Size Token | Pixel Value | Stroke Width | Primary Usage |
|---|---|---|---|
| `sm` | 16×16 px | 1.75 px | Badges, inline status tags, small button icons |
| `md` (default) | 20×20 px | 2.00 px | Navigation items, form inputs, standard buttons |
| `lg` | 24×24 px | 2.00 px | Feature headers, section icons, mega menu triggers |
| `xl` | 32×32 px | 2.00 px | Hero highlight items, key solution cards |
| `2xl` | 48×48 px | 1.75 px | Marketing illustrations, empty state focal points |

### 2.2 Color Inheritance
All interface and brand icons must default to `currentColor` for both `stroke` and `fill` unless explicitly assigned a tokenized class (e.g., `text-[--color-accent]`). Never hardcode hex values inside SVG paths.

---

## 3. RTL (Right-to-Left) Icon Flipping Rules

In Arabic RTL layouts, not all icons flip. Flipping icons incorrectly is a critical accessibility and UX defect:

| Icon Category | Flip in RTL? | Examples | Rule / Reason |
|---|---|---|---|
| **Directional Navigation** | ✅ **YES** | `ArrowRight`, `ArrowLeft`, `ChevronRight`, `ChevronLeft` | Direction indicates forwards/backwards progression in text flow. |
| **Clocks & Time** | ❌ **NO** | `Clock`, `Timer`, `AlarmClock` | Clock hands always rotate clockwise globally. |
| **Status & Validation** | ❌ **NO** | `CheckCircle`, `XCircle`, `AlertTriangle` | Symmetrical or standardized universal meaning. |
| **Media Controls** | ❌ **NO** | `Play`, `Pause`, `FastForward` | Audio/video progress is physically left-to-right. |
| **Tools & Objects** | ❌ **NO** | `Scissors`, `Lock`, `Shield`, `Calendar`, `DollarSign` | Represents physical tools with no inherent reading direction. |

Implementation helper:
```tsx
// Directional icon with RTL-aware utility
<ChevronRight className="h-5 w-5 rtl:rotate-180 transition-transform" />
```

---

## 4. Domain Icon Organization Matrix

| Domain Module | Primary Icons Exported | Key Use Cases |
|---|---|---|
| `navigation` | `Home`, `Menu`, `X`, `ChevronDown`, `ChevronRight`, `ChevronLeft`, `Search`, `Filter`, `Globe` | SiteHeader, MegaMenu, MobileDrawer, Breadcrumbs |
| `corporate` | `Building2`, `Users`, `Target`, `Lightbulb`, `Handshake`, `Mail`, `Phone`, `Award` | About, Story, Founder, Values, Milestones, Contact |
| `product` | `LayoutDashboard`, `Settings`, `Zap`, `Boxes`, `Workflow`, `Cpu`, `Server`, `Database` | Platform, Ecosystem, Architecture, Developer API |
| `hr` | `Users`, `UserPlus`, `ClipboardList`, `CalendarClock`, `Contact` | Staff schedules, shifts, commissions, permissions |
| `crm` | `UserRound`, `MessageSquare`, `Star`, `HeartHandshake`, `Bell` | Client profiles, histories, loyalty, automated SMS |
| `booking` | `CalendarDays`, `CalendarCheck`, `Clock`, `Clock3`, `RefreshCw` | Appointment calendar, self-service booking, waitlists |
| `sales` | `ShoppingCart`, `CreditCard`, `Receipt`, `Wallet`, `TrendingUp`, `Tag` | POS terminals, invoices, daily registers, promotions |
| `inventory` | `Package`, `PackageCheck`, `Warehouse`, `Truck`, `ScanBarcode` | Stock tracking, purchase orders, supplier management |
| `analytics` | `BarChart3`, `LineChart`, `PieChart`, `Activity`, `Gauge` | Executive dashboards, revenue reports, branch metrics |
| `industries` | `Scissors`, `Sparkles`, `Flower2`, `Droplets`, `Dumbbell`, `Store` | Barbershops, Salons, Spas, Wellness Centers |
| `security` | `ShieldCheck`, `LockKeyhole`, `KeyRound`, `Fingerprint`, `UserCheck` | Tenant isolation, encryption, access control, audit logs |
| `status` | `CheckCircle2`, `AlertCircle`, `AlertTriangle`, `Loader2`, `WifiOff` | Form validation, server status, toast notifications |

