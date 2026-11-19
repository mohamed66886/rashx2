import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Input,
  PhoneInput,
  Select,
  DatePicker,
  TimePicker,
  DateTimePicker,
  Textarea,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  FormField,
  FileUpload,
} from '@rashx/ui';

describe('RASHX Input Primitives Suite', () => {
  describe('Input Primitive', () => {
    it('renders input with placeholder and handles typing', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input placeholder="أدخل اسمك" onChange={handleChange} />);

      const input = screen.getByPlaceholderText('أدخل اسمك');
      expect(input).toBeInTheDocument();

      await user.type(input, 'محمد');
      expect(handleChange).toHaveBeenCalled();
    });

    it('toggles password visibility when isPassword is true', async () => {
      const user = userEvent.setup();
      render(<Input type="password" isPassword defaultValue="secret123" />);

      const toggleBtn = screen.getByLabelText('إظهار كلمة المرور');
      expect(toggleBtn).toBeInTheDocument();

      await user.click(toggleBtn);
      expect(screen.getByLabelText('إخفاء كلمة المرور')).toBeInTheDocument();
    });

    it('displays and triggers clear button when clearable is true', async () => {
      const user = userEvent.setup();
      const handleClear = vi.fn();
      render(<Input clearable value="نص قابل للمسح" onClear={handleClear} onChange={() => {}} />);

      const clearBtn = screen.getByLabelText('مسح النص');
      expect(clearBtn).toBeInTheDocument();

      await user.click(clearBtn);
      expect(handleClear).toHaveBeenCalledTimes(1);
    });

    it('renders start and end adornments', () => {
      render(
        <Input
          startAdornment={<span data-testid="prefix">@</span>}
          endAdornment={<span data-testid="suffix">SAR</span>}
        />,
      );

      expect(screen.getByTestId('prefix')).toBeInTheDocument();
      expect(screen.getByTestId('suffix')).toBeInTheDocument();
    });
  });

  describe('PhoneInput Primitive', () => {
    it('renders default Saudi Arabia country code +966 and mobile input', () => {
      render(<PhoneInput placeholder="5X XXX XXXX" />);

      expect(screen.getByText('+966')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('5X XXX XXXX')).toBeInTheDocument();
    });

    it('opens country picker dropdown on click', async () => {
      const user = userEvent.setup();
      render(<PhoneInput />);

      const triggerBtn = screen.getByLabelText('اختر الدولة');
      await user.click(triggerBtn);

      expect(screen.getByText('الإمارات')).toBeInTheDocument();
      expect(screen.getByText('+971')).toBeInTheDocument();
    });
  });

  describe('Select Dropdown Primitive', () => {
    const options = [
      { value: 'salon', label: 'صالون نسائي' },
      { value: 'barber', label: 'صالون رجالي' },
      { value: 'spa', label: 'مركز سبا وعناية' },
    ];

    it('renders placeholder and opens options list on click', async () => {
      const user = userEvent.setup();
      render(<Select options={options} placeholder="اختر نوع المنشأة..." />);

      expect(screen.getByText('اختر نوع المنشأة...')).toBeInTheDocument();

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText('صالون نسائي')).toBeInTheDocument();
      expect(screen.getByText('صالون رجالي')).toBeInTheDocument();
      expect(screen.getByText('مركز سبا وعناية')).toBeInTheDocument();
    });

    it('triggers onChange when an option is selected', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      render(<Select options={options} onChange={handleSelect} />);

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('مركز سبا وعناية'));

      expect(handleSelect).toHaveBeenCalledWith('spa');
    });
  });

  describe('DatePicker Primitive', () => {
    it('renders calendar trigger and opens day grid', async () => {
      const user = userEvent.setup();
      render(<DatePicker placeholder="حدد موعد الجلسة..." />);

      const trigger = screen.getByRole('button');
      expect(screen.getByText('حدد موعد الجلسة...')).toBeInTheDocument();

      await user.click(trigger);
      expect(screen.getByRole('dialog', { name: 'التقويم' })).toBeInTheDocument();
      expect(screen.getByText('اليوم')).toBeInTheDocument();
    });
  });

  describe('TimePicker Primitive', () => {
    it('renders time trigger and opens appointment slots', async () => {
      const user = userEvent.setup();
      render(<TimePicker placeholder="اختر وقت الجلسة..." lang="ar" />);

      const trigger = screen.getByRole('button');
      expect(screen.getByText('اختر وقت الجلسة...')).toBeInTheDocument();

      await user.click(trigger);
      expect(screen.getByRole('dialog', { name: 'اختيار الوقت' })).toBeInTheDocument();
      expect(screen.getByText('9:00 ص')).toBeInTheDocument();
    });
  });

  describe('DateTimePicker Primitive', () => {
    it('renders combined date and time inputs', () => {
      render(<DateTimePicker />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Textarea Primitive', () => {
    it('renders textarea with character count', () => {
      render(
        <Textarea
          placeholder="أدخل ملاحظات العميل..."
          maxLength={200}
          showCount
          value="ملاحظة أولية"
          onChange={() => {}}
        />,
      );

      expect(screen.getByPlaceholderText('أدخل ملاحظات العميل...')).toBeInTheDocument();
      expect(screen.getByText('12 / 200')).toBeInTheDocument();
    });
  });

  describe('Checkbox Primitive', () => {
    it('renders label and toggles checked state', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <Checkbox
          label="الموافقة على شروط الحجز"
          description="تطبق سياسة الإلغاء قبل 24 ساعة"
          onChange={handleChange}
        />,
      );

      expect(screen.getByText('الموافقة على شروط الحجز')).toBeInTheDocument();
      expect(screen.getByText('تطبق سياسة الإلغاء قبل 24 ساعة')).toBeInTheDocument();

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('RadioGroup Primitive', () => {
    it('renders radio options and handles selection', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <RadioGroup value="vip" onChange={handleChange} aria-label="باقات الخدمة">
          <Radio value="standard" label="الباقة الأساسية" />
          <Radio value="vip" label="باقة كبار الشخصيات VIP" />
        </RadioGroup>,
      );

      expect(screen.getByText('الباقة الأساسية')).toBeInTheDocument();
      expect(screen.getByText('باقة كبار الشخصيات VIP')).toBeInTheDocument();

      const standardRadio = screen.getByRole('radio', { name: /الباقة الأساسية/i });
      await user.click(standardRadio);
      expect(handleChange).toHaveBeenCalledWith('standard');
    });
  });

  describe('Switch Primitive', () => {
    it('renders switch toggle with accessible role', async () => {
      const user = userEvent.setup();
      const handleToggle = vi.fn();
      render(
        <Switch
          label="تفعيل الإشعارات الفورية"
          description="إرسال رسائل تذكير بالمواعيد عبر WhatsApp"
          onChange={handleToggle}
        />,
      );

      expect(screen.getByText('تفعيل الإشعارات الفورية')).toBeInTheDocument();

      const switchInput = screen.getByRole('switch');
      expect(switchInput).not.toBeChecked();

      await user.click(switchInput);
      expect(handleToggle).toHaveBeenCalled();
      expect(switchInput).toBeChecked();
    });

    it('handles controlled checked state correctly', async () => {
      const { rerender } = render(<Switch checked={true} readOnly />);
      const switchInput = screen.getByRole('switch');
      expect(switchInput).toBeChecked();

      rerender(<Switch checked={false} readOnly />);
      expect(switchInput).not.toBeChecked();
    });
  });

  describe('FormField Wrapper', () => {
    it('renders label, input, and binds error message', () => {
      render(
        <FormField
          label="البريد الإلكتروني للصالون"
          required
          errorMessage="يرجى إدخال عنوان بريد إلكتروني صحيح"
        >
          <Input type="email" placeholder="salon@example.com" />
        </FormField>,
      );

      expect(screen.getByText('البريد الإلكتروني للصالون')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('يرجى إدخال عنوان بريد إلكتروني صحيح');

      const input = screen.getByPlaceholderText('salon@example.com');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('FileUpload Primitive', () => {
    it('renders dropzone variant with label and helper text', () => {
      render(
        <FileUpload
          variant="dropzone"
          label="اسحب الملفات هنا"
          helperText="PDF أو صور حتى 10MB"
        />,
      );

      expect(screen.getByText('اسحب الملفات هنا')).toBeInTheDocument();
      expect(screen.getByText('PDF أو صور حتى 10MB')).toBeInTheDocument();
      expect(screen.getByText('تصفح جهازك')).toBeInTheDocument();
    });

    it('renders compact variant and displays selected file name', () => {
      const file = new File(['dummy content'], 'contract.pdf', { type: 'application/pdf' });
      render(<FileUpload variant="compact" value={[file]} />);

      expect(screen.getByText('contract.pdf')).toBeInTheDocument();
      expect(screen.getByText('اختيار ملف')).toBeInTheDocument();
    });

    it('renders avatar variant and button variant', () => {
      const { rerender } = render(
        <FileUpload variant="avatar" label="شعار الصالون" />
      );
      expect(screen.getByText('شعار الصالون')).toBeInTheDocument();

      rerender(<FileUpload variant="button" label="رفع ملف" />);
      expect(screen.getByText('رفع ملف')).toBeInTheDocument();
    });

    it('handles file selection via input change', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<FileUpload variant="compact" onChange={handleChange} />);

      const file = new File(['test file'], 'license.png', { type: 'image/png' });
      const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(hiddenInput).toBeInTheDocument();

      await user.upload(hiddenInput, file);
      expect(handleChange).toHaveBeenCalled();
    });
  });
});
