import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header, Footer, MobileNavigation, LanguageSwitcher } from '@/components/layout';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(''),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe('RASHX Header & Footer Layout Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Header Component', () => {
    it('renders the official bilingual logo with link to home', () => {
      render(<Header lang="ar" />);
      const logoLink = screen.getByRole('link', { name: /راش إكس - الصفحة الرئيسية/i });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('renders desktop navigation links in Arabic with correct valid destinations', () => {
      render(<Header lang="ar" />);
      const nav = screen.getByRole('navigation', { name: /الملاحة الرئيسية/i });
      expect(nav).toBeInTheDocument();

      const homeLink = screen.getByRole('link', { name: 'الرئيسية' });
      const brandLink = screen.getByRole('link', { name: 'دليل الهوية' });
      const pillarsLink = screen.getByRole('link', { name: 'الركائز الهندسية' });

      expect(homeLink).toHaveAttribute('href', '/');
      expect(brandLink).toHaveAttribute('href', '/brand');
      expect(pillarsLink).toHaveAttribute('href', '/#pillars');
    });

    it('renders desktop navigation links in English with ?lang=en parameters', () => {
      render(<Header lang="en" />);
      const homeLink = screen.getByRole('link', { name: 'Home' });
      const brandLink = screen.getByRole('link', { name: 'Brand Showcase' });
      const pillarsLink = screen.getByRole('link', { name: 'Engineering Pillars' });

      expect(homeLink).toHaveAttribute('href', '/?lang=en');
      expect(brandLink).toHaveAttribute('href', '/brand?lang=en');
      expect(pillarsLink).toHaveAttribute('href', '/?lang=en#pillars');
    });

    it('renders primary CTA with "اكتشف RASHX" in Arabic and "Discover RASHX" in English', () => {
      const { unmount } = render(<Header lang="ar" />);
      const ctaAr = screen.getAllByRole('link', { name: 'اكتشف RASHX' });
      expect(ctaAr.length).toBeGreaterThanOrEqual(1);
      expect(ctaAr[0]).toHaveAttribute('href', '/brand');
      unmount();

      render(<Header lang="en" />);
      const ctaEn = screen.getAllByRole('link', { name: 'Discover RASHX' });
      expect(ctaEn.length).toBeGreaterThanOrEqual(1);
      expect(ctaEn[0]).toHaveAttribute('href', '/brand?lang=en');
    });

    it('applies correct text direction (RTL for Arabic, LTR for English)', () => {
      const { container: containerAr, unmount } = render(<Header lang="ar" />);
      expect(containerAr.querySelector('header')).toHaveAttribute('dir', 'rtl');
      unmount();

      const { container: containerEn } = render(<Header lang="en" />);
      expect(containerEn.querySelector('header')).toHaveAttribute('dir', 'ltr');
    });

    it('strict audit: header contains ZERO decorative border and shadow classes', () => {
      const { container } = render(<Header lang="ar" />);
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();

      const allElements = container.querySelectorAll('*');
      allElements.forEach((el) => {
        const classNames = el.className;
        if (typeof classNames === 'string') {
          // Check for border-* (excluding focus-visible:ring or similar)
          expect(classNames).not.toMatch(/\bborder\b/);
          expect(classNames).not.toMatch(/\bborder-[tbrl]\b/);
          // Check for shadow-*
          expect(classNames).not.toMatch(/\bshadow(-[a-z0-9]+)?\b/);
        }
      });
    });
  });

  describe('MobileNavigation Component', () => {
    const navLinks = [
      { label: 'الرئيسية', href: '/' },
      { label: 'دليل الهوية', href: '/brand' },
      { label: 'الركائز الهندسية', href: '/#pillars' },
    ];
    const cta = { label: 'اكتشف RASHX', href: '/brand' };

    it('renders accessible hamburger button with correct aria attributes', () => {
      render(<MobileNavigation lang="ar" navLinks={navLinks} cta={cta} />);
      const trigger = screen.getByRole('button', { name: /فتح القائمة الرئيسية/i });
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      expect(trigger).toHaveAttribute('aria-controls', 'mobile-navigation-drawer');
    });

    it('opens mobile drawer on trigger click and closes on close button click', async () => {
      const user = userEvent.setup();
      render(<MobileNavigation lang="ar" navLinks={navLinks} cta={cta} />);

      const trigger = screen.getByRole('button', { name: /فتح القائمة الرئيسية/i });
      await user.click(trigger);

      const dialog = screen.getByRole('dialog', { name: /قائمة التنقل/i });
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');

      const closeButton = screen.getByRole('button', { name: /إغلاق القائمة$/i });
      expect(closeButton).toBeInTheDocument();

      await user.click(closeButton);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes mobile drawer when pressing the Escape key', async () => {
      const user = userEvent.setup();
      render(<MobileNavigation lang="ar" navLinks={navLinks} cta={cta} />);

      const trigger = screen.getByRole('button', { name: /فتح القائمة الرئيسية/i });
      await user.click(trigger);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes mobile drawer when clicking a navigation link', async () => {
      const user = userEvent.setup();
      render(<MobileNavigation lang="ar" navLinks={navLinks} cta={cta} />);

      const trigger = screen.getByRole('button', { name: /فتح القائمة الرئيسية/i });
      await user.click(trigger);

      const brandLink = screen.getByRole('link', { name: 'دليل الهوية' });
      await user.click(brandLink);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('strict audit: mobile drawer contains ZERO decorative border and shadow classes', async () => {
      const user = userEvent.setup();
      const { container } = render(<MobileNavigation lang="ar" navLinks={navLinks} cta={cta} />);

      const trigger = screen.getByRole('button', { name: /فتح القائمة الرئيسية/i });
      await user.click(trigger);

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

  describe('Footer Component', () => {
    it('renders semantic footer with white bilingual logo', () => {
      render(<Footer lang="ar" />);
      const logoLink = screen.getByRole('link', { name: /راش إكس - الصفحة الرئيسية/i });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('renders official Arabic company description and metadata', () => {
      render(<Footer lang="ar" />);
      expect(
        screen.getByText(
          'راش إكس منظومة رقمية متكاملة تساعد صالونات التجميل والحلاقة والسبا على إدارة أعمالها وتطوير تجربة عملائها.'
        )
      ).toBeInTheDocument();
      expect(screen.getByText(/المملكة العربية السعودية · الرياض/i)).toBeInTheDocument();
      expect(screen.getByText(/التأسيس: 2026/i)).toBeInTheDocument();
    });

    it('renders official English company description and metadata in English mode', () => {
      render(<Footer lang="en" />);
      expect(
        screen.getByText(
          'RASHX is a complete digital operating system helping beauty salons, barbershops, and spas manage their operations and elevate customer experiences.'
        )
      ).toBeInTheDocument();
      expect(screen.getByText(/Kingdom of Saudi Arabia · Riyadh/i)).toBeInTheDocument();
      expect(screen.getByText(/Founded: 2026/i)).toBeInTheDocument();
    });

    it('renders verified official social media links with target="_blank" and rel="noopener noreferrer"', () => {
      render(<Footer lang="ar" />);

      const twitter = screen.getByRole('link', { name: /منصة إكس \(تويتر\)/i });
      const linkedin = screen.getByRole('link', { name: /لينكدإن/i });
      const instagram = screen.getByRole('link', { name: /إنستغرام/i });

      expect(twitter).toHaveAttribute('href', 'https://x.com/rashxsa');
      expect(twitter).toHaveAttribute('target', '_blank');
      expect(twitter).toHaveAttribute('rel', 'noopener noreferrer');

      expect(linkedin).toHaveAttribute('href', 'https://www.linkedin.com/company/rashx');
      expect(linkedin).toHaveAttribute('target', '_blank');
      expect(linkedin).toHaveAttribute('rel', 'noopener noreferrer');

      expect(instagram).toHaveAttribute('href', 'https://www.instagram.com/rashx.sa');
      expect(instagram).toHaveAttribute('target', '_blank');
      expect(instagram).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders founder attribution and copyright notice', () => {
      render(<Footer lang="ar" />);
      expect(
        screen.getByText(
          'المؤسس: م. محمد عبده رشاد البهي · جميع الحقوق محفوظة © 2026 راش إكس لتقنية المعلومات'
        )
      ).toBeInTheDocument();
    });

    it('strict audit: footer contains ZERO decorative border and shadow classes', () => {
      const { container } = render(<Footer lang="ar" />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();

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

  describe('LanguageSwitcher Component', () => {
    it('renders language toggle button with globe icon and proper label', () => {
      render(<LanguageSwitcher currentLang="ar" />);
      const switcher = screen.getByRole('link', { name: /تغيير اللغة إلى الإنجليزية/i });
      expect(switcher).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('renders Arabic label when currentLang is en', () => {
      render(<LanguageSwitcher currentLang="en" />);
      const switcher = screen.getByRole('link', { name: /Change language to Arabic/i });
      expect(switcher).toBeInTheDocument();
      expect(screen.getByText('العربية')).toBeInTheDocument();
    });
  });
});
