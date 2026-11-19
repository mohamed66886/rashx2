import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionTitle } from '@/components/sections';

describe('RASHX — SectionTitle Primitive Component Suite', () => {
  describe('Semantic Heading Output & Defaults', () => {
    it('renders an h2 heading element by default', () => {
      render(<SectionTitle title="كل تفاصيل صالونك في مكان واحد" />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H2');
      expect(heading).toHaveTextContent('كل تفاصيل صالونك في مكان واحد');
    });

    it('renders custom semantic heading levels when provided via "as"', () => {
      const { rerender } = render(
        <SectionTitle title="العنوان كـ H1" as="h1" />
      );
      expect(screen.getByRole('heading', { level: 1 }).tagName).toBe('H1');

      rerender(<SectionTitle title="العنوان كـ H3" as="h3" />);
      expect(screen.getByRole('heading', { level: 3 }).tagName).toBe('H3');

      rerender(<SectionTitle title="Heading as H4" as="h4" />);
      expect(screen.getByRole('heading', { level: 4 }).tagName).toBe('H4');
    });

    it('renders only title without eyebrow when eyebrow is omitted', () => {
      const { container } = render(
        <SectionTitle title="عنوان بدون حاجب علوي" />
      );

      expect(container.querySelectorAll('span')).toHaveLength(0);
      expect(screen.getByText('عنوان بدون حاجب علوي')).toBeInTheDocument();
    });

    it('renders optional eyebrow label when provided', () => {
      render(
        <SectionTitle
          eyebrow="لماذا RASHX؟"
          title="إدارة أكثر سهولة ووضوحًا"
        />
      );

      const eyebrowEl = screen.getByText('لماذا RASHX؟');
      expect(eyebrowEl).toBeInTheDocument();
      expect(eyebrowEl.tagName).toBe('SPAN');
      expect(screen.getByText('إدارة أكثر سهولة ووضوحًا')).toBeInTheDocument();
    });
  });

  describe('Alignment Modes & Direction (RTL / LTR)', () => {
    it('applies start alignment by default (text-start items-start)', () => {
      const { container } = render(
        <SectionTitle title="محاذاة البداية الافتراضية" />
      );

      const root = container.firstElementChild;
      expect(root?.className).toContain('text-start');
      expect(root?.className).toContain('items-start');
      expect(root?.className).not.toContain('text-center');
    });

    it('applies center alignment when align="center" is passed', () => {
      const { container } = render(
        <SectionTitle
          eyebrow="WHY RASHX"
          title="Elevate Every Salon Touchpoint"
          align="center"
        />
      );

      const root = container.firstElementChild;
      expect(root?.className).toContain('text-center');
      expect(root?.className).toContain('items-center');
    });

    it('correctly adapts under Arabic RTL and English LTR containers', () => {
      const { unmount } = render(
        <div dir="rtl">
          <SectionTitle
            eyebrow="المنظومة الرقمية"
            title="تحكم شامل في كافة العمليات"
            align="start"
          />
        </div>
      );

      const rtlHeading = screen.getByRole('heading', {
        name: 'تحكم شامل في كافة العمليات',
      });
      const rtlRoot = rtlHeading.parentElement;
      expect(rtlRoot?.className).toContain('text-start');
      expect(rtlRoot?.className).toContain('items-start');

      unmount();

      render(
        <div dir="ltr">
          <SectionTitle
            eyebrow="PLATFORM HIGHLIGHTS"
            title="Unified Salon Cloud Infrastructure"
            align="start"
          />
        </div>
      );

      const ltrHeading = screen.getByRole('heading', {
        name: 'Unified Salon Cloud Infrastructure',
      });
      const ltrRoot = ltrHeading.parentElement;
      expect(ltrRoot?.className).toContain('text-start');
      expect(ltrRoot?.className).toContain('items-start');
    });
  });

  describe('Long Titles & Mobile Wrap Resilience', () => {
    it('includes responsive scaling and word-break protection for long mobile titles', () => {
      const veryLongArabicTitle =
        'نظام متكامل يربط المبيعات والمخزون والموظفات والفواتير الضريبية وتطبيق العميلات في شاشة واحدة فائقة السلاسة';

      render(<SectionTitle title={veryLongArabicTitle} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading.className).toContain('break-words');
      expect(heading.className).toContain('text-balance');
      expect(heading.className).toContain('text-2xl');
      expect(heading.className).toContain('sm:text-3xl');
      expect(heading.className).toContain('md:text-4xl');
      expect(heading.className).toContain('lg:text-[2.5rem]');
    });
  });

  describe('Strict Zero Borders and Zero Shadows Compliance', () => {
    it('ensures component container, eyebrow, and heading have no decorative borders or shadows', () => {
      const { container } = render(
        <SectionTitle
          eyebrow="تدقيق الهوية الرسمية"
          title="خالي تماماً من الحواف والظلال التزيينية"
          align="center"
        />
      );

      const root = container.firstElementChild;
      expect(root?.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
      expect(root?.className).not.toMatch(/\bborder\b/);

      const eyebrow = screen.getByText('تدقيق الهوية الرسمية');
      expect(eyebrow.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
      expect(eyebrow.className).not.toMatch(/\bborder\b/);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading.className).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
      expect(heading.className).not.toMatch(/\bborder\b/);
    });
  });

  describe('Props Forwarding & Custom Classes', () => {
    it('appends custom className and forwards native HTML div attributes', () => {
      const { container } = render(
        <SectionTitle
          title="العنوان الرئيسي"
          className="custom-section-class"
          data-testid="custom-section-title"
          id="custom-section-id"
        />
      );

      const root = container.firstElementChild;
      expect(root?.className).toContain('custom-section-class');
      expect(screen.getByTestId('custom-section-title')).toBeInTheDocument();
      expect(root).toHaveAttribute('id', 'custom-section-id');
    });
  });
});
