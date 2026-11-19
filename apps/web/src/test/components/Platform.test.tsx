import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  PlatformHero,
  ConnectedEcosystem,
  CoreSystems,
  WhiteLabelSection,
  TenancySecurity,
  SaudiCompliance,
  VisionMissionGoals,
  PlatformCTA,
} from '@/components/platform';

describe('RASHX Platform Page Sections Suite', () => {
  describe('Section 1: PlatformHero', () => {
    it('renders Arabic heading and corporate introduction', () => {
      render(<PlatformHero lang="ar" />);
      expect(
        screen.getByRole('heading', { level: 1, name: /منظومة رقمية متكاملة لقطاع الجمال/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/المملكة العربية السعودية · 2026/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /طلب عرض تجريبي/i })).toBeInTheDocument();
    });

    it('renders English heading in English mode', () => {
      render(<PlatformHero lang="en" />);
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /A Complete Digital Ecosystem for the Beauty Industry/i,
        })
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Request a Demo/i })).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<PlatformHero lang="ar" />);
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

  describe('Section 2: ConnectedEcosystem', () => {
    it('renders the 4 ecosystem touchpoints in Arabic', () => {
      render(<ConnectedEcosystem lang="ar" />);
      expect(
        screen.getByRole('heading', { level: 2, name: /كل منشأة، منظومة رقمية متكاملة/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/الموقع الإلكتروني للمنشأة \(Website\)/i)).toBeInTheDocument();
      expect(screen.getByText(/لوحة التحكم الإدارية \(Admin Dashboard\)/i)).toBeInTheDocument();
      expect(screen.getByText(/تطبيق العملاء \(Customer Experience\)/i)).toBeInTheDocument();
      expect(screen.getByText(/تطبيق مقدمي الخدمة \(Staff & Specialists\)/i)).toBeInTheDocument();
    });

    it('renders the centralized cloud core diagram', () => {
      render(<ConnectedEcosystem lang="ar" />);
      expect(screen.getByText(/محرك راش إكس السحابي المركزي/i)).toBeInTheDocument();
      expect(screen.getByText(/مزامنة فورية للمواعيد وتفادي التعارض/i)).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<ConnectedEcosystem lang="ar" />);
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

  describe('Section 3: CoreSystems', () => {
    it('renders the 10 core systems grouped into 5 categories', () => {
      render(<CoreSystems lang="ar" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /الأنظمة الأساسية لإدارة وتشغيل الصالونات ومراكز التجميل/i,
        })
      ).toBeInTheDocument();

      // Check systems
      expect(screen.getByText('نظام إدارة المنشأة والفروع')).toBeInTheDocument();
      expect(screen.getByText('نظام إدارة الموظفين والصلاحيات')).toBeInTheDocument();
      expect(screen.getByText('نظام الحجوزات والمواعيد والتقويم')).toBeInTheDocument();
      expect(screen.getByText('نظام إدارة العملاء وسجل المعاملات')).toBeInTheDocument();
      expect(screen.getByText('نظام إدارة الخدمات والتسعير')).toBeInTheDocument();
      expect(screen.getByText('نظام نقاط البيع والفواتير السحابية')).toBeInTheDocument();
      expect(screen.getByText('نظام إدارة المخزون والمشتريات')).toBeInTheDocument();
      expect(screen.getByText('نظام العمولات والحوافز الذكية')).toBeInTheDocument();
      expect(screen.getByText('نظام ولاء العملاء والعروض والخصومات')).toBeInTheDocument();
      expect(screen.getByText('نظام التقارير والتحليلات ولوحات المتابعة')).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<CoreSystems lang="ar" />);
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

  describe('Section 4: WhiteLabelSection', () => {
    it('renders white-labeling capabilities and brand protection', () => {
      render(<WhiteLabelSection lang="ar" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /هوية منشأتك أولًا، وتقنية راش إكس في الخلفية/i,
        })
      ).toBeInTheDocument();
      expect(screen.getByText('نطاق رقمي مخصص للمنشأة')).toBeInTheDocument();
      expect(screen.getByText('ألوان وشعار المنشأة الكامل')).toBeInTheDocument();
      expect(screen.getByText('علاقة مباشرة ومحمية مع عميلاتك')).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<WhiteLabelSection lang="ar" />);
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

  describe('Section 5: TenancySecurity', () => {
    it('renders multi-tenant isolation and security specifications', () => {
      render(<TenancySecurity lang="ar" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /عزل رقمي مستقل وأمان مؤسسي صارم/i,
        })
      ).toBeInTheDocument();
      expect(screen.getByText('عزل منطقي كامل للمستأجرين (Tenant Isolation)')).toBeInTheDocument();
      expect(screen.getByText('صلاحيات دقيقة بحسب الدور الوظيفي (Granular RBAC)')).toBeInTheDocument();
      expect(screen.getByText('TLS 1.3 / HTTPS')).toBeInTheDocument();
      expect(screen.getByText('AES-256 Standard')).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<TenancySecurity lang="ar" />);
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

  describe('Section 6: SaudiCompliance', () => {
    it('renders ZATCA e-invoicing Phase 1 and Phase 2 details without fabricated claims', () => {
      render(<SaudiCompliance lang="ar" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /جاهزية تامة للسوق السعودي ومعايير هيئة الزكاة والضريبة والجمارك/i,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText('الفاتورة الضريبية المبسطة ورمز الاستجابة السريع (QR)')
      ).toBeInTheDocument();
      expect(
        screen.getByText('الجاهزية الهندسية لمرحلة الربط والتكامل (المرحلة الثانية)')
      ).toBeInTheDocument();
      expect(screen.getByText('حساب ضريبة القيمة المضافة (15% VAT)')).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<SaudiCompliance lang="ar" />);
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

  describe('Section 7: VisionMissionGoals', () => {
    it('renders vision, mission, strategic goals, and founder attribution', () => {
      render(<VisionMissionGoals lang="ar" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /الرؤية، الرسالة، والأهداف الاستراتيجية/i,
        })
      ).toBeInTheDocument();
      expect(screen.getByText('رؤيتنا (Our Vision)')).toBeInTheDocument();
      expect(screen.getByText('رسالتنا (Our Mission)')).toBeInTheDocument();
      expect(screen.getByText(/المهندس محمد عبده رشاد البهي/i)).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<VisionMissionGoals lang="ar" />);
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

  describe('Section 8: PlatformCTA', () => {
    it('renders the call to action with email and brand links', () => {
      render(<PlatformCTA lang="ar" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /جاهز لنقل صالونك إلى العصر الرقمي/i,
        })
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /طلب استشارة وعرض تجريبي/i })).toHaveAttribute(
        'href',
        'mailto:hello@rashx.com'
      );
      expect(
        screen.getByRole('link', { name: /استكشف دليل الهوية الرسمية/i })
      ).toHaveAttribute('href', '/brand');
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<PlatformCTA lang="ar" />);
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

