# RASHX — Brand Kit / هوية راش اكس

كل الملفات SVG متتبّعة من التصميم الأصلي (الحروف paths مش خط).

## Structure
- `logo/wordmark` — RASHX (Rx بدل R)
- `logo/wordmark-arabic` — راش اكس + Rx
- `logo/symbol-rx` — رمز Rx
- `logo/lockup-bilingual` — عربي + إنجليزي
  (كل لوجو: `-ink` / `-white` شفاف، و `-on-ink` / `-on-white` / `-on-blue` / `-on-peach` / `-on-cream` بخلفية)
- `icons/` — app icons + favicons
- `social/` — avatars, covers, OG share
- `documents/` — ورق رسمي (EN/AR)، فاتورة، كروت، ظرف، توقيع إيميل، قوالب بريزنتيشن
- `email/` — توقيع إيميل (HTML + SVG)، قالب رسالة EN/AR، هيدر، ونسخ PNG للوجو (`images/`)
- `fonts/` — إعداد الخط Ping AR + LT (`fonts.css` + README) — حط ملفات الخط فيه
- `guidelines.svg` — صفحة إرشادات

## Colours
- Primary · Warm Peach `#F0C5AE`
- Secondary · Dusty Blue `#91B8C0`
- Base · White `#FFFFFF`
- Base 2 · Soft Cream `#FAF9F8`
- Ink `#54453D` للوجو وكل النصوص

> الخوخي والأزرق تباينهم ضعيف مع الأبيض، فاستخدمهم كخلفيات وتفاصيل، واللوجو والنص بلون Ink فوقهم (تباين Ink على الخوخي حوالي 5.8:1 وعلى الأزرق 4.3:1 وعلى الأبيض 9:1).

## Typography
الخط: **Ping AR + LT** — Regular 400 · Medium 500 · Bold 700 · Extra Bold 800. الخط مرخّص ومش مضمّن، شوف `fonts/README.md`.

## Email
Gmail وOutlook مش بيعرضوا SVG، فاستخدم صور `email/images/` (PNG) وارفعها على موقعك وغيّر روابط `src` في ملفات HTML قبل الاستخدام.

## Notes
- النصوص بين [ ] placeholders للتعديل.
- الرمز Rx هو العلامة المختصرة.
