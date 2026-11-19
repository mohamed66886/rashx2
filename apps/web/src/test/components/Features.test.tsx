import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  FeaturesHero,
  FeatureCategories,
  DetailedFeatureShowcase,
  ConnectedWorkflow,
  BusinessControl,
  FeaturesCTA,
} from '@/components/features';

describe('RASHX Features Page Sections Suite', () => {
  describe('Section 1: FeaturesHero', () => {
    it('renders Arabic heading and core description', () => {
      render(<FeaturesHero lang="ar" />);
      expect(
        screen.getByRole('heading', { level: 1, name: /كل الأدوات التي تحتاجها لإدارة منشأتك/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/اكتشف مجموعة من الأدوات المترابطة التي تساعدك على تنظيم عمليات الصالون/i)
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /استكشف المميزات بالتفصيل/i })).toBeInTheDocument();
    });

    it('renders English heading in English mode', () => {
      render(<FeaturesHero lang="en" />);
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /Everything You Need to Manage Your Business/i,
        })
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Explore All Features/i })).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<FeaturesHero lang="ar" />);
      const allElements = container.querySelectorAll('*');
      allElements.forEach((el) => {
        const classNames = el.className;
        if (typeof classNames === 'string') {
          expect(classNames).not.toMatch(/\bborder\b/);
          expect(classNames).not.toMatch(/\bborder-[tbrl]\b/);
          expect(classNames).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        }
      });
    });
  });

  describe('Section 2: FeatureCategories', () => {
    it('renders the 6 operational categories in Arabic', () => {
      render(<FeatureCategories lang="ar" />);
      expect(
        screen.getByRole('heading', { level: 2, name: /تنظيم شامل لكافة جوانب العمل في منشأتك/i })
      ).toBeInTheDocument();
      expect(screen.getByText('إدارة العمليات والمواعيد')).toBeInTheDocument();
      expect(screen.getByText('إدارة علاقات العملاء (CRM)')).toBeInTheDocument();
      expect(screen.getByText('إدارة الفريق والعمولات')).toBeInTheDocument();
      expect(screen.getByText('نقاط البيع والفواتير (POS)')).toBeInTheDocument();
      expect(screen.getByText('إدارة المخزون والاستهلاك')).toBeInTheDocument();
      expect(screen.getByText('التقارير ومؤشرات الأداء')).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<FeatureCategories lang="ar" />);
      const allElements = container.querySelectorAll('*');
      allElements.forEach((el) => {
        const classNames = el.className;
        if (typeof classNames === 'string') {
          expect(classNames).not.toMatch(/\bborder\b/);
          expect(classNames).not.toMatch(/\bborder-[tbrl]\b/);
          expect(classNames).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        }
      });
    });
  });

  describe('Section 3: DetailedFeatureShowcase', () => {
    it('renders the 5 core showcases with problem and benefit details', () => {
      render(<DetailedFeatureShowcase lang="ar" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /تفاصيل دقيقة تعالج تحديات تشغيل الصالونات اليومية/i,
        })
      ).toBeInTheDocument();

      expect(screen.getByText('جدول المواعيد والتقويم الذكي التفاعلي')).toBeInTheDocument();
      expect(screen.getByText('كاشير نقاط البيع السريع والفوترة الضريبية المبسطة')).toBeInTheDocument();
      expect(screen.getByText('ملف العميل المتكامل وتوثيق تركيبات الصبغة')).toBeInTheDocument();
      expect(screen.getByText('أتمتة عمولات وحوافز الأخصائيات بنزاهة وشفافية')).toBeInTheDocument();
      expect(screen.getByText('الموقع الإلكتروني الخاص وبوابة الحجز الذاتي 24/7')).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<DetailedFeatureShowcase lang="ar" />);
      const allElements = container.querySelectorAll('*');
      allElements.forEach((el) => {
        const classNames = el.className;
        if (typeof classNames === 'string') {
          expect(classNames).not.toMatch(/\bborder\b/);
          expect(classNames).not.toMatch(/\bborder-[tbrl]\b/);
          expect(classNames).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        }
      });
    });
  });

  describe('Section 4: ConnectedWorkflow', () => {
    it('renders all 6 lifecycle workflow steps in sequence', () => {
      render(<ConnectedWorkflow lang="ar" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /كيف تترابط وظائف راش إكس في يوم عمل حقيقي/i,
        })
      ).toBeInTheDocument();
      expect(screen.getByText('إعداد الخدمة والتسعير')).toBeInTheDocument();
      expect(screen.getByText('إتاحة الفترات في التقويم')).toBeInTheDocument();
      expect(screen.getByText('استقبال وتأكيد الحجز')).toBeInTheDocument();
      expect(screen.getByText('تنفيذ الخدمة وتحديث الحالة')).toBeInTheDocument();
      expect(screen.getByText('المحاسبة والفوترة الضريبية')).toBeInTheDocument();
      expect(screen.getByText('تحديث التقارير والعمولات فوريًا')).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<ConnectedWorkflow lang="ar" />);
      const allElements = container.querySelectorAll('*');
      allElements.forEach((el) => {
        const classNames = el.className;
        if (typeof classNames === 'string') {
          expect(classNames).not.toMatch(/\bborder\b/);
          expect(classNames).not.toMatch(/\bborder-[tbrl]\b/);
          expect(classNames).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        }
      });
    });
  });

  describe('Section 5: BusinessControl', () => {
    it('renders 6 executive control pillars with realistic metrics', () => {
      render(<BusinessControl lang="ar" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /رؤية كاملة وتحكم لحظي في تفاصيل منشأتك/i,
        })
      ).toBeInTheDocument();
      expect(screen.getByText('متابعة الحجوزات والجدول')).toBeInTheDocument();
      expect(screen.getByText('التحكم المالي والمبيعات')).toBeInTheDocument();
      expect(screen.getByText('أداء الفريق والعمولات')).toBeInTheDocument();
      expect(screen.getByText('قاعدة وبيانات العملاء')).toBeInTheDocument();
      expect(screen.getByText('الرقابة على المخزون')).toBeInTheDocument();
      expect(screen.getByText('الأداء العام للمنشأة')).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<BusinessControl lang="ar" />);
      const allElements = container.querySelectorAll('*');
      allElements.forEach((el) => {
        const classNames = el.className;
        if (typeof classNames === 'string') {
          expect(classNames).not.toMatch(/\bborder\b/);
          expect(classNames).not.toMatch(/\bborder-[tbrl]\b/);
          expect(classNames).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        }
      });
    });
  });

  describe('Section 6: FeaturesCTA', () => {
    it('renders the call to action with platform link and email', () => {
      render(<FeaturesCTA lang="ar" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /اكتشف كيف يمكن لـ RASHX تنظيم أعمال منشأتك/i,
        })
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /استكشف المنصة التقنية/i })).toHaveAttribute(
        'href',
        '/platform'
      );
      expect(screen.getByRole('link', { name: /تواصل معنا لطلب عرض/i })).toHaveAttribute(
        'href',
        'mailto:hello@rashx.com'
      );
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<FeaturesCTA lang="ar" />);
      const allElements = container.querySelectorAll('*');
      allElements.forEach((el) => {
        const classNames = el.className;
        if (typeof classNames === 'string') {
          expect(classNames).not.toMatch(/\bborder\b/);
          expect(classNames).not.toMatch(/\bborder-[tbrl]\b/);
          expect(classNames).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        }
      });
    });
  });
});

