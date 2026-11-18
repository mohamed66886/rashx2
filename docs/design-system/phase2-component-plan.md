# RASHX Design System — Phase 2 Component Inventory & Implementation Plan

> **Status:** Architecture Blueprint · **Date:** 2026-11-18 · **Package:** `@rashx/ui`  
> **Target:** 26 Accessible, High-Performance Components for Corporate RASHX

---

## 1. Architectural Principles

1. **Server Components by Default**: Components are RSC unless client interactivity (state, event listeners, portals, or browser APIs) explicitly requires `'use client'`.
2. **Selective Radix Primitives**: Radix is utilized exclusively for complex accessible state machines (Focus trap, keyboard navigation, ARIA live regions: Dialog, DropdownMenu, Accordion, Tabs, Tooltip, Switch). Simple HTML elements (Button, Input, Badge, Card, Typography, Separator) use pure semantic HTML without wrapper overhead.
3. **Variant-First with CVA**: All styling variants are declared using `class-variance-authority`. Zero inline conditional class string concatenation.
4. **Strict RTL First-Class Support**: Layouts, margins, paddings, and directional arrows use logical CSS properties (`ms-`, `me-`, `ps-`, `pe-`) or Tailwind `rtl:`/`ltr:` modifiers.
5. **Centralized Utility**: All class merges use `cn()` from `@rashx/ui/lib/cn`.

---

## 2. Component Inventory & Technical Specifications

---

### GROUP A: Foundations

#### 1. Button
- **Responsibility**: Primary interactive button triggering actions or navigating via `asChild`.
- **Environment**: Server Component compatible (`asChild` via Radix Slot).
- **Props**: `variant` ('primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive'), `size` ('sm' | 'md' | 'lg' | 'xl' | 'icon'), `loading` (boolean), `asChild` (boolean).
- **A11y**: Standard `<button>` keyboard handling, `aria-disabled` when loading, visible focus ring.
- **RTL**: Automatic alignment; gap between text and icons handled with `gap-2`.
- **Dependencies**: `@radix-ui/react-slot`, `class-variance-authority`.
- **Tests**: Click triggers, loading disabled state, asChild Link rendering.
- **Example**:
  ```tsx
  <Button variant="primary" size="lg">ابدأ الآن</Button>
  <Button asChild variant="outline"><Link href="/pricing">الأسعار</Link></Button>
  ```

#### 2. Link
- **Responsibility**: Accessible hyperlink wrapping Next.js `<Link>` with tokenized styling.
- **Environment**: Server Component.
- **Props**: `href`, `variant` ('default' | 'muted' | 'accent' | 'nav'), `external` (boolean), `children`.
- **A11y**: When external, appends `rel="noopener noreferrer"` and screen-reader notice.
- **RTL**: Native inline text flow.
- **Dependencies**: `next/link`.
- **Tests**: Correct href resolution, external target handling.
- **Example**:
  ```tsx
  <Link href={routes.about} variant="nav">من نحن</Link>
  ```

#### 3. IconButton
- **Responsibility**: Square icon-only interactive button requiring an explicit accessible label.
- **Environment**: Server Component compatible.
- **Props**: `icon` (LucideIcon), `aria-label` (string, required), `variant`, `size`.
- **A11y**: Enforces non-empty `aria-label` via TypeScript interface.
- **RTL**: Directional icons handle rotation via CSS.
- **Dependencies**: `@rashx/ui/primitives/Button`.
- **Tests**: Throws type error without `aria-label`, click handling.
- **Example**:
  ```tsx
  <IconButton icon={Menu} aria-label="فتح القائمة الرئيسية" variant="ghost" />
  ```

#### 4. Badge
- **Responsibility**: Compact visual indicator for status, counts, or categorization.
- **Environment**: Server Component.
- **Props**: `variant` ('default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error' | 'info'), `size` ('sm' | 'md').
- **A11y**: Static presentation (`<span>`).
- **RTL**: Natural inline flow.
- **Dependencies**: `class-variance-authority`.
- **Tests**: Variant class resolution.
- **Example**:
  ```tsx
  <Badge variant="success">نشط</Badge>
  <Badge variant="default">جديد</Badge>
  ```

#### 5. Typography
- **Responsibility**: Polymorphic typographic hierarchy component enforcing type-token scales.
- **Environment**: Server Component.
- **Props**: `as` ('h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'), `variant` ('display-1' | 'display-2' | 'h1' | 'h2' | 'h3' | 'body-lg' | 'body' | 'body-sm' | 'caption'), `color` ('default' | 'muted' | 'accent').
- **A11y**: Guarantees correct semantic heading levels decoupled from visual styling.
- **RTL**: Arabic line-height optimized (`relaxed` on Arabic headings).
- **Dependencies**: `class-variance-authority`.
- **Tests**: Correct DOM element rendered with matching variant classes.
- **Example**:
  ```tsx
  <Typography as="h1" variant="display-1">أكثر من مجرد إدارة</Typography>
  ```

#### 6. Separator
- **Responsibility**: Visual or semantic divider between sections or list items.
- **Environment**: Server Component (pure HTML `<hr>`).
- **Props**: `orientation` ('horizontal' | 'vertical'), `decorative` (boolean).
- **A11y**: `role="none"` when decorative; `role="separator"` when semantic.
- **RTL**: Vertical dividers use border coordinates appropriately.
- **Dependencies**: None.
- **Tests**: ARIA attribute correctness.
- **Example**:
  ```tsx
  <Separator orientation="horizontal" className="my-8" />
  ```

#### 7. Avatar
- **Responsibility**: User or salon profile image with accessible initials fallback.
- **Environment**: Client Component (image load state handling).
- **Props**: `src` (string), `alt` (string, required), `fallback` (string), `size` ('sm' | 'md' | 'lg' | 'xl').
- **A11y**: Meaningful `alt` text; `aria-hidden` fallback initial.
- **RTL**: Symmetric circle/square.
- **Dependencies**: None (native React state avoids Radix Avatar weight).
- **Tests**: Fallback displays when image errors or is absent.
- **Example**:
  ```tsx
  <Avatar src="/images/founder.jpg" alt="م. محمد عبده رشاد البهي" fallback="م‌ر" />
  ```

---

### GROUP B: Form Components

#### 8. Input
- **Responsibility**: Single-line text input field supporting icons, error states, and RTL.
- **Environment**: Client Component (controlled/uncontrolled input).
- **Props**: Standard `InputHTMLAttributes`, `error` (boolean | string), `startIcon`, `endIcon`.
- **A11y**: `aria-invalid`, `aria-describedby` linked to FormField helper.
- **RTL**: `startIcon` placed at right in RTL, left in LTR using logical classes (`ps-10`, `pe-4`).
- **Dependencies**: None.
- **Tests**: Value change, error border styling, icon positioning in RTL.
- **Example**:
  ```tsx
  <Input type="email" placeholder="name@company.com" startIcon={<Mail />} />
  ```

#### 9. Textarea
- **Responsibility**: Multi-line text input for contact, consultation, and support inquiries.
- **Environment**: Client Component.
- **Props**: Standard `TextareaHTMLAttributes`, `error`, `rows`.
- **A11y**: `aria-invalid`, focus visible.
- **RTL**: Natural right alignment for Arabic text.
- **Dependencies**: None.
- **Tests**: Render and error states.
- **Example**:
  ```tsx
  <Textarea rows={4} placeholder="تفاصيل الاستفسار أو متطلبات العمل..." />
  ```

#### 10. Select
- **Responsibility**: Accessible custom dropdown select list.
- **Environment**: Client Component (Radix Select state machine).
- **Props**: `options` (Array<{ label: string, value: string }>), `value`, `onChange`, `placeholder`, `error`.
- **A11y**: Full keyboard navigation (Up/Down/Enter/Escape), ARIA listbox roles.
- **RTL**: Chevron indicator on start/end dynamically, dropdown aligns to text origin.
- **Dependencies**: `@radix-ui/react-select`.
- **Tests**: Keyboard selection, open/close state, change emission.
- **Example**:
  ```tsx
  <Select placeholder="اختر حجم الصالون" options={salonSizes} />
  ```

#### 11. Checkbox
- **Responsibility**: Binary toggle for form agreements (Terms, privacy policy).
- **Environment**: Client Component (Radix Checkbox).
- **Props**: `checked`, `onCheckedChange`, `label` (ReactNode), `error`.
- **A11y**: Keyboard spacebar toggle, `aria-checked`, high-contrast checkmark.
- **RTL**: Checkbox on the right of label in Arabic (`me-3`).
- **Dependencies**: `@radix-ui/react-checkbox`.
- **Tests**: Toggle on click and spacebar.
- **Example**:
  ```tsx
  <Checkbox label="أوافق على شروط الخدمة وسياسة الخصوصية" />
  ```

#### 12. RadioGroup
- **Responsibility**: Single selection among mutually exclusive business options (e.g. pricing frequency: monthly vs annual).
- **Environment**: Client Component (Radix Radio Group).
- **Props**: `name`, `options`, `value`, `onValueChange`.
- **A11y**: Arrow key navigation between options, `aria-checked`.
- **RTL**: Indicator on right side of label.
- **Dependencies**: `@radix-ui/react-radio-group`.
- **Tests**: Arrow key navigation, selection change.
- **Example**:
  ```tsx
  <RadioGroup options={billingFrequencies} value={billing} onValueChange={setBilling} />
  ```

#### 13. Switch
- **Responsibility**: Instant binary toggle for user preferences (Dark mode, auto-renew, SMS alert).
- **Environment**: Client Component (Radix Switch).
- **Props**: `checked`, `onCheckedChange`, `aria-label`.
- **A11y**: `role="switch"`, `aria-checked`, keyboard focus ring.
- **RTL**: Slider track translation reverses direction in RTL (`rtl:-translate-x-full`).
- **Dependencies**: `@radix-ui/react-switch`.
- **Tests**: Translates correctly in RTL vs LTR, invokes change handler.
- **Example**:
  ```tsx
  <Switch checked={isAnnual} onCheckedChange={setIsAnnual} aria-label="الفوترة السنوية" />
  ```

#### 14. FormField
- **Responsibility**: Form field container orchestrating label, input, helper text, and validation error.
- **Environment**: Server Component compatible wrapper.
- **Props**: `label` (string), `required` (boolean), `error` (string), `helperText` (string), `children`.
- **A11y**: Automatically links label `htmlFor` with input `id`, and error message to `aria-describedby`.
- **RTL**: Labels align with field origin.
- **Dependencies**: None.
- **Tests**: Error text renders with role="alert" when error provided.
- **Example**:
  ```tsx
  <FormField label="البريد الإلكتروني" required error={errors.email}>
    <Input {...register('email')} />
  </FormField>
  ```

---

### GROUP C: Interactive Overlays

#### 15. Dialog (Modal)
- **Responsibility**: Accessible modal window for critical workflows (Demo request, quote generator).
- **Environment**: Client Component (Portal + Focus Trap).
- **Props**: `open`, `onOpenChange`, `title`, `description`, `trigger`, `children`.
- **A11y**: Focus trap, Escape key closes, returns focus to trigger, `aria-labelledby`, `aria-describedby`.
- **RTL**: Close button placed on top-left in RTL (opposite of English top-right).
- **Dependencies**: `@radix-ui/react-dialog`.
- **Tests**: Focus trap operates, closes on Escape, renders in Portal.
- **Example**:
  ```tsx
  <Dialog trigger={<Button>طلب عرض</Button>} title="طلب عرض تجريبي">
    <DemoForm />
  </Dialog>
  ```

#### 16. DropdownMenu
- **Responsibility**: Contextual or trigger-based menu (Header navigation menus, user action lists).
- **Environment**: Client Component (Radix Dropdown).
- **Props**: `trigger` (ReactNode), `items` (Array<{ label: string, href?: string, onClick?: () => void, icon?: LucideIcon }>).
- **A11y**: Arrow navigation, auto-focus first item on open, Enter activates.
- **RTL**: Align to `end` in RTL, text right-aligned.
- **Dependencies**: `@radix-ui/react-dropdown-menu`.
- **Tests**: Open on trigger click, keyboard navigation through items.
- **Example**:
  ```tsx
  <DropdownMenu trigger={<Button variant="ghost">الحلول <ChevronDown /></Button>} items={solutionItems} />
  ```

#### 17. Accordion
- **Responsibility**: Collapsible content sections (FAQ, features drill-down).
- **Environment**: Client Component (Radix Accordion).
- **Props**: `type` ('single' | 'multiple'), `items` (Array<{ id: string, title: string, content: ReactNode }>).
- **A11y**: `aria-expanded`, keyboard Up/Down arrow moves between headers.
- **RTL**: Indicator chevron flips or rotates smoothly on start/end.
- **Dependencies**: `@radix-ui/react-accordion`.
- **Tests**: Expand/collapse toggle, keyboard navigation.
- **Example**:
  ```tsx
  <Accordion type="single" items={faqItems} />
  ```

#### 18. Tabs
- **Responsibility**: Content switcher for switching views without page navigation (e.g., Barbershop vs Salon features).
- **Environment**: Client Component (Radix Tabs).
- **Props**: `tabs` (Array<{ id: string, label: string, content: ReactNode }>), `defaultValue`.
- **A11y**: `role="tablist"`, `role="tab"`, ArrowLeft / ArrowRight switches tabs with correct RTL awareness.
- **RTL**: Tab arrow navigation reverses in RTL (ArrowRight goes to previous item in RTL).
- **Dependencies**: `@radix-ui/react-tabs`.
- **Tests**: Arrow key navigation in RTL and LTR modes.
- **Example**:
  ```tsx
  <Tabs tabs={industryTabs} defaultValue="salons" />
  ```

#### 19. Tooltip
- **Responsibility**: Informational micro-copy on hover or focus of icon buttons or technical terms.
- **Environment**: Client Component (Radix Tooltip).
- **Props**: `content` (string), `children` (ReactNode), `side` ('top' | 'bottom' | 'start' | 'end').
- **A11y**: Visible on keyboard focus; dismisses on Escape; `role="tooltip"`.
- **RTL**: `side="start"` resolves to right in RTL and left in LTR.
- **Dependencies**: `@radix-ui/react-tooltip`.
- **Tests**: Appears on focus, hides on blur.
- **Example**:
  ```tsx
  <Tooltip content="الفوترة الإلكترونية متوافقة مع الأنظمة السعودية">
    <ShieldCheck className="h-5 w-5 text-green-600" />
  </Tooltip>
  ```

#### 20. Toast
- **Responsibility**: Transient alert notifications (e.g. "تم إرسال طلبك بنجاح").
- **Environment**: Client Component (Portal + Timer).
- **Props**: `variant` ('success' | 'error' | 'info'), `title`, `description`, `duration`.
- **A11y**: `aria-live="polite"` for non-critical alerts, `aria-live="assertive"` for errors.
- **RTL**: Slides in from bottom-right in RTL (bottom-left in LTR).
- **Dependencies**: None (lightweight hook + portal provider).
- **Tests**: Auto-dismiss after duration, manual dismiss button.
- **Example**:
  ```tsx
  toast.success('تم استلام طلب التواصل بنجاح');
  ```

---

### GROUP D: Display & Commercial Cards

#### 21. Card
- **Responsibility**: Base container for structured content with tokenized border, background, and hover states.
- **Environment**: Server Component.
- **Props**: `variant` ('default' | 'elevated' | 'interactive' | 'accent'), `padded` (boolean), `children`.
- **A11y**: Semantic `<article>` or `<div>`.
- **RTL**: Natural layout.
- **Dependencies**: None.
- **Tests**: Renders with correct token surfaces.
- **Example**:
  ```tsx
  <Card variant="interactive"><h3>إدارة الحجوزات</h3></Card>
  ```

#### 22. FeatureCard
- **Responsibility**: Highlighting a single platform module or technological advantage.
- **Environment**: Server Component.
- **Props**: `icon` (LucideIcon), `title` (string), `description` (string), `badge` (optional string), `href` (optional string).
- **A11y**: When `href` provided, entire card is wrapped or contains an accessible link overlay.
- **RTL**: Icon and title align to right.
- **Dependencies**: `packages/ui/content/Card`, `packages/ui/primitives/Badge`.
- **Tests**: Renders icon, badge, and content.
- **Example**:
  ```tsx
  <FeatureCard icon={CalendarDays} title="الحجوزات الذكية" description="نظام جدولة متكامل..." badge="أساسي" />
  ```

#### 23. PricingCard
- **Responsibility**: Displaying subscription plan tiers, features list, and direct conversion CTA.
- **Environment**: Server Component.
- **Props**: `name` (string), `description` (string), `price` (number | string), `period` (string), `features` (string[]), `popular` (boolean), `ctaText` (string), `ctaHref` (string).
- **A11y**: Highlighted plan announced with screen-reader badge ("الخيار الأكثر شعبية").
- **RTL**: Currency placed according to language (`SAR 499` in EN, `499 ر.س` in AR).
- **Dependencies**: `packages/ui/content/Card`, `packages/ui/primitives/Button`.
- **Tests**: Highlights popular variant, renders features list with checks.
- **Example**:
  ```tsx
  <PricingCard name="برو" price="499" period="شهرياً" popular features={features} ctaText="ابدأ تجربتك" ctaHref="/demo" />
  ```

#### 24. StatCard
- **Responsibility**: Displaying verifiable operational numbers, uptime percentages, or system scale.
- **Environment**: Server Component.
- **Props**: `value` (string), `label` (string), `trend` (optional { direction: 'up' | 'down', text: string }), `icon` (optional LucideIcon).
- **A11y**: Screen-reader friendly metric phrasing.
- **RTL**: Trends align with metric value.
- **Dependencies**: None.
- **Tests**: Correct value rendering.
- **Example**:
  ```tsx
  <StatCard value="99.98%" label="موثوقية النظام (Uptime)" />
  ```

#### 25. TestimonialCard
- **Responsibility**: Displaying real, verifiable salon customer testimonials and case quotes.
- **Environment**: Server Component.
- **Props**: `quote` (string), `authorName` (string), `authorRole` (string), `salonName` (string), `city` (string), `avatarUrl` (optional string).
- **A11y**: `<blockquote>` element with `<cite>`.
- **RTL**: Quotation marks match Arabic typographic standards.
- **Dependencies**: `packages/ui/content/Card`, `packages/ui/foundations/Avatar`.
- **Tests**: Semantic blockquote structure.
- **Example**:
  ```tsx
  <TestimonialCard quote="منظومة راش إكس اختصرت وقت الجدولة اليومية بنسبة 60%..." authorName="سارة العمري" authorRole="مالكة الصالون" salonName="صالون لوميير" city="الرياض" />
  ```

---

### GROUP E: Site & Shell Components

#### 26. LanguageSwitcher
- **Responsibility**: Toggling between Arabic (RTL) and English (LTR) while preserving the active route.
- **Environment**: Client Component.
- **Props**: `variant` ('button' | 'dropdown' | 'icon').
- **A11y**: `aria-label="تغيير اللغة"` / `"Change language"`.
- **RTL**: Visual toggle reverses direction appropriately.
- **Dependencies**: `next/navigation`, `@rashx/i18n`.
- **Tests**: Appends `?lang=en` or removes it for default Arabic; persists cookie.
- **Example**:
  ```tsx
  <LanguageSwitcher variant="button" />
  ```

#### 27. ThemeSwitcher
- **Responsibility**: Toggling Light Mode, Dark Mode, or System Preference.
- **Environment**: Client Component.
- **Props**: `variant` ('icon' | 'dropdown').
- **A11y**: `aria-label="تبديل المظهر"`, keyboard accessible.
- **RTL**: Icon rotation.
- **Dependencies**: None (toggles `dark` class on `document.documentElement` + sets cookie/localStorage).
- **Tests**: Updates DOM class list and localStorage.
- **Example**:
  ```tsx
  <ThemeSwitcher variant="icon" />
  ```

#### 28. PageContainer & SectionContainer
- **Responsibility**: Standardizing horizontal constraints and vertical section cadence across all pages.
- **Environment**: Server Component.
- **Props**: `size` ('sm' | 'md' | 'lg' | 'xl' | '2xl'), `spacing` ('sm' | 'md' | 'lg' | 'xl'), `as` ('section' | 'article' | 'div').
- **A11y**: Enforces semantic sectioning elements.
- **RTL**: Symmetrical margins (`mx-auto`) and gutters.
- **Dependencies**: None.
- **Tests**: Correct width and padding classes.
- **Example**:
  ```tsx
  <SectionContainer spacing="lg">
    <PageContainer size="xl">
      <SectionHeading title="الحلول الرقمية" />
    </PageContainer>
  </SectionContainer>
  ```

