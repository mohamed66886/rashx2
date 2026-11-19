import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  AboutHero,
  WhoWeAre,
  OurStory,
  VisionMission,
  OurValues,
  OurFocus,
  AboutCTA,
} from '@/components/about';

describe('RASHX About Us Page Sections Suite', () => {
  describe('Section A: AboutHero', () => {
    it('renders exact Arabic heading, eyebrow, and description', () => {
      render(<AboutHero lang="ar" />);
      expect(screen.getByText('من نحن')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'نبني تجربة رقمية أكثر تكاملًا لقطاع الجمال.',
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'نعمل على تطوير منظومة رقمية تساعد الصالونات ومراكز التجميل والسبا على إدارة أعمالها وتقديم تجربة أكثر تنظيمًا وترابطًا.'
        )
      ).toBeInTheDocument();
    });

    it('renders exact English heading, eyebrow, and description', () => {
      render(<AboutHero lang="en" />);
      expect(screen.getByText('ABOUT RASHX')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Building a More Connected Digital Experience for Beauty.',
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'We develop digital solutions that help salons, beauty centers, and spas manage their operations and deliver a more connected experience.'
        )
      ).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<AboutHero lang="ar" />);
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

  describe('Section B: WhoWeAre', () => {
    it('renders institutional pillars and company purpose', () => {
      render(<WhoWeAre lang="ar" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /منصة رقمية متخصصة تُعيد تعريف إدارة قطاع الجمال/i,
        })
      ).toBeInTheDocument();
      expect(screen.getByText('توحيد كافة العمليات في مكان واحد')).toBeInTheDocument();
      expect(screen.getByText('تبسيط الإدارة اليومية للصالون')).toBeInTheDocument();
      expect(screen.getByText('ترابط تلقائي بين الوظائف التشغيلية')).toBeInTheDocument();
      expect(screen.getByText('دعم تجربة عملاء منظمة واستثنائية')).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<WhoWeAre lang="ar" />);
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

  describe('Section C: OurStory', () => {
    it('renders verified founding date and founder attribution', () => {
      render(<OurStory lang="ar" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /من فكرة متخصصة إلى منظومة تشغيل رقمية متكاملة/i,
        })
      ).toBeInTheDocument();
      expect(screen.getByText('م. محمد عبده رشاد البهي')).toBeInTheDocument();
      expect(screen.getByText('مؤسس RASHX | راش إكس')).toBeInTheDocument();
      expect(screen.getByText('2026')).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<OurStory lang="ar" />);
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

  describe('Sections D & E: VisionMission', () => {
    it('renders exact Arabic vision and mission statements', () => {
      render(<VisionMission lang="ar" />);
      expect(
        screen.getByText(
          'أن نكون من الحلول الرقمية الرائدة في تطوير تجربة إدارة وتشغيل منشآت قطاع الجمال.'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'تطوير حلول رقمية مترابطة تساعد منشآت قطاع الجمال على تنظيم عملياتها، وتحسين تجربة عملائها، وإدارة أعمالها بكفاءة أكبر.'
        )
      ).toBeInTheDocument();
    });

    it('renders exact English vision and mission statements', () => {
      render(<VisionMission lang="en" />);
      expect(
        screen.getByText(
          'To become a leading digital solution in transforming how beauty businesses manage and operate their services.'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'To build connected digital solutions that help beauty businesses organize operations, improve customer experiences, and manage their businesses more effectively.'
        )
      ).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<VisionMission lang="ar" />);
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

  describe('Section F: OurValues', () => {
    it('renders the 5 core guiding values', () => {
      render(<OurValues lang="ar" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /القيم التي تحكم طريقة بنائنا للمنظومة/i,
        })
      ).toBeInTheDocument();
      expect(screen.getByText('البساطة')).toBeInTheDocument();
      expect(screen.getByText('التكامل')).toBeInTheDocument();
      expect(screen.getByText('الموثوقية')).toBeInTheDocument();
      expect(screen.getByText('التطوير المستمر')).toBeInTheDocument();
      expect(screen.getByText('تجربة العميل')).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<OurValues lang="ar" />);
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

  describe('Section G: OurFocus', () => {
    it('renders the 3 specialized beauty and wellness sectors', () => {
      render(<OurFocus lang="ar" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /تركيز دقيق وحصري على قطاع الجمال والعناية/i,
        })
      ).toBeInTheDocument();
      expect(screen.getByText('صالونات التجميل والحلاقة')).toBeInTheDocument();
      expect(screen.getByText('مراكز التجميل والعناية الشاملة')).toBeInTheDocument();
      expect(screen.getByText('مراكز السبا والاسترخاء')).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<OurFocus lang="ar" />);
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

  describe('Section H: AboutCTA', () => {
    it('renders exact Arabic heading and verified internal links', () => {
      render(<AboutCTA lang="ar" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'هل أنت مستعد لتجربة إدارة أكثر تكاملًا؟',
        })
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /استكشف المنصة التقنية/i })).toHaveAttribute(
        'href',
        '/platform'
      );
      expect(screen.getByRole('link', { name: /استكشف مميزات المنظومة/i })).toHaveAttribute(
        'href',
        '/features'
      );
      expect(screen.getByRole('link', { name: /تواصل معنا مباشرة/i })).toHaveAttribute(
        'href',
        'mailto:hello@rashx.com'
      );
    });

    it('renders exact English heading in English mode', () => {
      render(<AboutCTA lang="en" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Ready for a More Connected Way to Manage Your Business?',
        })
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Explore the Platform/i })).toHaveAttribute(
        'href',
        '/platform?lang=en'
      );
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<AboutCTA lang="ar" />);
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

