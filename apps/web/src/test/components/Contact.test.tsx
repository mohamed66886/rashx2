import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ContactHero,
  ContactTopics,
  ContactForm,
  DirectContact,
  ContactCTA,
} from '@/components/contact';

describe('RASHX Contact Page Sections Suite', () => {
  describe('Section A: ContactHero', () => {
    it('renders exact Arabic heading, eyebrow, and description', () => {
      render(<ContactHero lang="ar" />);
      expect(screen.getByText('تواصل معنا')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'نحن هنا لمساعدتك على اتخاذ الخطوة التالية.',
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'سواء كنت ترغب في التعرف على RASHX أو لديك استفسار حول المنصة، يسعدنا التواصل معك.'
        )
      ).toBeInTheDocument();
    });

    it('renders exact English heading, eyebrow, and description', () => {
      render(<ContactHero lang="en" />);
      expect(screen.getByText('CONTACT US')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: "We're Here to Help You Take the Next Step.",
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Whether you want to learn more about RASHX or have a question about the platform, we'd be happy to hear from you."
        )
      ).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<ContactHero lang="ar" />);
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

  describe('Section D: ContactTopics', () => {
    it('renders the 5 required inquiry categories', () => {
      render(<ContactTopics lang="ar" />);
      expect(screen.getByText('مجالات الاستفسار')).toBeInTheDocument();
      expect(screen.getByText('معلومات المنصة')).toBeInTheDocument();
      expect(screen.getByText('استفسارات الاشتراك')).toBeInTheDocument();
      expect(screen.getByText('الدعم الفني')).toBeInTheDocument();
      expect(screen.getByText('شراكات الأعمال')).toBeInTheDocument();
      expect(screen.getByText('استفسارات عامة')).toBeInTheDocument();
    });

    it('contains clear disclaimer that topics do not imply separate departments', () => {
      render(<ContactTopics lang="ar" />);
      expect(
        screen.getByText(
          /\* مواضيع الاستفسار أعلاه تهدف لتنظيم وتسهيل المتابعة، وليست دلالة على وجود أقسام أو إدارات مستقلة منفصلة\./i
        )
      ).toBeInTheDocument();
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<ContactTopics lang="ar" />);
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

  describe('Section B: ContactForm', () => {
    it('renders all required form input fields with labels and placeholders', () => {
      render(<ContactForm lang="ar" />);
      expect(screen.getByLabelText(/الاسم الكامل/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/اسم المنشأة أو الصالون/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/رقم الجوال/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/البريد الإلكتروني/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/نوع الاستفسار/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/تفاصيل الرسالة أو الاستفسار/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /إرسال الاستفسار/i })).toBeInTheDocument();
    });

    it('displays validation errors when submitting an empty form', async () => {
      const user = userEvent.setup();
      render(<ContactForm lang="ar" />);

      const submitBtn = screen.getByRole('button', { name: /إرسال الاستفسار/i });
      await user.click(submitBtn);

      expect(screen.getByText('الاسم الكامل مطلوب (حرفان على الأقل).')).toBeInTheDocument();
      expect(screen.getByText('اسم المنشأة أو الصالون مطلوب.')).toBeInTheDocument();
      expect(screen.getByText('يرجى إدخال رقم جوال صحيح (مثال: 05XXXXXXXX).')).toBeInTheDocument();
      expect(screen.getByText('يرجى إدخال عنوان بريد إلكتروني صحيح.')).toBeInTheDocument();
      expect(screen.getByText('يرجى كتابة رسالة توضيحية لا تقل عن 10 أحرف.')).toBeInTheDocument();
    });

    it('handles backend absence honestly without displaying fake success', async () => {
      const user = userEvent.setup();
      render(<ContactForm lang="ar" />);

      await user.type(screen.getByLabelText(/الاسم الكامل/i), 'سارة محمد');
      await user.type(screen.getByLabelText(/اسم المنشأة أو الصالون/i), 'صالون الجمال الراقي');
      await user.type(screen.getByLabelText(/رقم الجوال/i), '0548082945');
      await user.type(screen.getByLabelText(/البريد الإلكتروني/i), 'sarah@salon.com');
      await user.type(
        screen.getByLabelText(/تفاصيل الرسالة أو الاستفسار/i),
        'نود الاستفسار عن إمكانية تجربة المنظومة وإدارة 3 فروع صالون تجميل.'
      );

      const submitBtn = screen.getByRole('button', { name: /إرسال الاستفسار/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('تنبيه الربط التقني لقنوات الاستقبال')).toBeInTheDocument();
      });

      // Confirm no fake success message was shown
      expect(screen.queryByText('تم استلام استفسارك بنجاح')).not.toBeInTheDocument();

      // Confirm direct action links are provided
      expect(screen.getByRole('link', { name: /اتصال هاتفي مباشر/i })).toHaveAttribute(
        'href',
        'tel:+966548082945'
      );
      expect(screen.getByRole('link', { name: /مراسلة عبر تيليجرام/i })).toHaveAttribute(
        'href',
        'https://t.me/rashxsa'
      );
    });

    it('renders success state when a verified onSubmit handler resolves', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      render(<ContactForm lang="ar" onSubmit={mockSubmit} />);

      await user.type(screen.getByLabelText(/الاسم الكامل/i), 'نورة فهد');
      await user.type(screen.getByLabelText(/اسم المنشأة أو الصالون/i), 'مركز العناية والسبا');
      await user.type(screen.getByLabelText(/رقم الجوال/i), '0501234567');
      await user.type(screen.getByLabelText(/البريد الإلكتروني/i), 'noura@spa.com');
      await user.type(
        screen.getByLabelText(/تفاصيل الرسالة أو الاستفسار/i),
        'نود مناقشة اشتراك المركز وربط جداول المعالجات مع نقاط البيع.'
      );

      const submitBtn = screen.getByRole('button', { name: /إرسال الاستفسار/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledTimes(1);
        expect(screen.getByText('تم استلام استفسارك بنجاح')).toBeInTheDocument();
      });
    });

    it('renders failure state when a verified onSubmit handler rejects', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn().mockRejectedValue(new Error('Network error simulation'));
      render(<ContactForm lang="ar" onSubmit={mockSubmit} />);

      await user.type(screen.getByLabelText(/الاسم الكامل/i), 'نورة فهد');
      await user.type(screen.getByLabelText(/اسم المنشأة أو الصالون/i), 'مركز العناية والسبا');
      await user.type(screen.getByLabelText(/رقم الجوال/i), '0501234567');
      await user.type(screen.getByLabelText(/البريد الإلكتروني/i), 'noura@spa.com');
      await user.type(
        screen.getByLabelText(/تفاصيل الرسالة أو الاستفسار/i),
        'نود مناقشة اشتراك المركز وربط جداول المعالجات مع نقاط البيع.'
      );

      const submitBtn = screen.getByRole('button', { name: /إرسال الاستفسار/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('تعذر إرسال الاستفسار')).toBeInTheDocument();
        expect(screen.getByText('Network error simulation')).toBeInTheDocument();
      });
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<ContactForm lang="ar" />);
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

  describe('Section C: DirectContact', () => {
    it('renders verified telephone contact number without WhatsApp claim', () => {
      render(<DirectContact lang="ar" />);
      expect(screen.getByText('+966 54 808 2945')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /اتصل الآن/i })).toHaveAttribute(
        'href',
        'tel:+966548082945'
      );
      // Verify no unverified WhatsApp label
      expect(screen.queryByText(/واتساب/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/whatsapp/i)).not.toBeInTheDocument();
    });

    it('renders all verified social and digital platform links', () => {
      render(<DirectContact lang="ar" />);
      expect(screen.getByLabelText(/الموقع الرسمي/i)).toHaveAttribute(
        'href',
        'https://rashx.org'
      );
      expect(screen.getByLabelText(/قناة تيليجرام/i)).toHaveAttribute(
        'href',
        'https://t.me/rashxsa'
      );
      expect(screen.getByLabelText(/منصة إكس/i)).toHaveAttribute(
        'href',
        'https://x.com/rashxsa'
      );
      expect(screen.getByLabelText(/لينكدإن/i)).toHaveAttribute(
        'href',
        'https://www.linkedin.com/company/rashx'
      );
      expect(screen.getByLabelText(/إنستغرام/i)).toHaveAttribute(
        'href',
        'https://www.instagram.com/rashx.sa'
      );
      expect(screen.getByLabelText(/تيك توك/i)).toHaveAttribute(
        'href',
        'https://www.tiktok.com/@rashx.sa'
      );
      expect(screen.getByLabelText(/سناب شات/i)).toHaveAttribute(
        'href',
        'https://snapchat.com/t/MuwsbAAK'
      );
      expect(screen.getByLabelText(/فيسبوك/i)).toHaveAttribute(
        'href',
        'https://www.facebook.com/rashx.sa'
      );
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<DirectContact lang="ar" />);
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

  describe('Section E: ContactCTA', () => {
    it('renders exact Arabic heading and verified internal links only', () => {
      render(<ContactCTA lang="ar" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'هل ترغب في التعرف على RASHX بشكل أفضل؟',
        })
      ).toBeInTheDocument();

      const platformLink = screen.getByRole('link', { name: /استكشف المنظومة/i });
      expect(platformLink).toHaveAttribute('href', '/platform');

      const featuresLink = screen.getByRole('link', { name: /استكشف مميزات المنصة/i });
      expect(featuresLink).toHaveAttribute('href', '/features');
    });

    it('renders exact English heading in English mode', () => {
      render(<ContactCTA lang="en" />);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Would you like to learn more about RASHX?',
        })
      ).toBeInTheDocument();

      const platformLink = screen.getByRole('link', { name: /Explore Platform/i });
      expect(platformLink).toHaveAttribute('href', '/platform?lang=en');

      const featuresLink = screen.getByRole('link', { name: /Explore Features/i });
      expect(featuresLink).toHaveAttribute('href', '/features?lang=en');
    });

    it('contains zero decorative borders and shadows', () => {
      const { container } = render(<ContactCTA lang="ar" />);
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

