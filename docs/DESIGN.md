# PadosiPro Design Reference System

> **Notice:** The design tokens and layout conventions documented here are **visual reference values** observed from the public PadosiPro website for aesthetic alignment. They are not proprietary source code or production assets. All components, styling systems, and business implementations in this repository are original and purpose-built for the PadosiPro Full-Stack Assignment.

---

## 1. Visual Language & Principles

- **Clean & Professional:** A calm, trustworthy aesthetic designed for service professionals and clients.
- **Restrained Color Palette:** Deep forest green primary actions set against neutral whites and warm off-white canvas.
- **Spacious Hierarchy:** Comfortable vertical rhythm, distinct visual grouping, and generous whitespace.
- **Soft Geometry:** A consistent `12px` border radius on interactive elements, cards, and input fields.
- **Surface Elevation:** Subtle borders and minimal elevation to distinguish cards and modals from the canvas.

---

## 2. Color Palette Tokens

| Token Name | Hex Value | Usage / Description |
| :--- | :--- | :--- |
| `primary` | `#155C49` | Primary action buttons, active states, key interactive highlights |
| `primaryHover` | `#104738` | Hover / pressed state for primary actions |
| `primaryLight` | `#E8F2EE` | Soft tint for selected chips, badge backgrounds, and subtle accents |
| `textPrimary` | `#101828` | Main headings, primary body copy, titles |
| `textSecondary` | `#667085` | Subheadings, placeholder text, secondary metadata, captions |
| `background` | `#FAFAF7` | Overall application canvas / viewport background |
| `surface` | `#FFFFFF` | Card surfaces, modal sheets, input backgrounds, navigation bars |
| `border` | `#E4E7EC` | Hairline dividers, card outlines, input field borders |
| `borderFocus` | `#155C49` | Focused input border |
| `error` | `#D92D20` | Form validation errors, destructive actions, alert toasts |
| `errorLight` | `#FEF3F2` | Error banner/callout background |
| `success` | `#079455` | Confirmation states, success badges, checkmarks |
| `successLight` | `#ECFDF3` | Success banner background |

---

## 3. Typography Tokens

The reference design pairs a distinctive display heading style with an accessible system font stack for crisp legibility across mobile platforms.

| Typography Role | Size | Line Height | Weight | Reference Family / Fallback |
| :--- | :--- | :--- | :--- | :--- |
| **Heading 1 (H1)** | `30px` | `38px` | `700` (Bold / SemiBold) | `Eina01-SemiBold`, System Sans-Serif |
| **Heading 2 (H2)** | `24px` | `32px` | `600` (SemiBold) | System Sans-Serif |
| **Heading 3 (H3)** | `20px` | `28px` | `600` (SemiBold) | System Sans-Serif |
| **Subheading** | `18px` | `26px` | `500` (Medium) | System Sans-Serif |
| **Body Default** | `16px` | `24px` | `400` (Regular) | System Sans-Serif |
| **Body Medium** | `16px` | `24px` | `500` (Medium) | System Sans-Serif |
| **Body Small** | `14px` | `20px` | `400` (Regular) | System Sans-Serif |
| **Metadata / Label** | `12px` | `16px` | `500` (Medium) | System Sans-Serif |
| **Caption** | `11px` | `14px` | `400` (Regular) | System Sans-Serif |

---

## 4. Layout & Spacing Tokens

A base unit of `4px` with standard multiples:

| Token | Size | Common Application |
| :--- | :--- | :--- |
| `space.xs` | `4px` | Badge padding, micro spacing |
| `space.sm` | `8px` | Inner gap between icon and text |
| `space.md` | `12px` | Compact button padding, card inner margins |
| `space.lg` | `16px` | Standard screen horizontal padding, form field gaps |
| `space.xl` | `20px` | Section margins |
| `space.2xl` | `24px` | Container padding, modal header spacing |
| `space.3xl` | `32px` | Major section breaks |
| `space.4xl` | `40px` | Screen top/bottom gutters |

---

## 5. Shape & Corner Radii

| Token | Radius | Usage |
| :--- | :--- | :--- |
| `radius.sm` | `6px` | Small badges, tags |
| `radius.md` | `8px` | Small buttons, chip items |
| `radius.lg` | `12px` | Standard interactive buttons, text inputs, card containers |
| `radius.xl` | `16px` | Floating cards, modal sheets |
| `radius.full` | `9999px` | Avatars, circular icon buttons, pills |

---

## 6. Component Guidelines

- **Primary Buttons:** High-contrast background (`#155C49`) with pure white text (`#FFFFFF`), `12px` corner radius, `16px` vertical hit area (minimum 48px touch target).
- **Form Inputs:** Bordered with `#E4E7EC`, white background (`#FFFFFF`), text `#101828`, placeholder `#667085`, `12px` radius.
- **Cards & Surfaces:** Off-white page background (`#FAFAF7`) with white card surfaces (`#FFFFFF`) bounded by a subtle `1px` border (`#E4E7EC`) or light shadow.
- **Status States:** Every interactive flow must clearly indicate loading (spinners/skeletons), empty lists (helpful guidance and illustrations), and error feedback (clear inline error text or toast notifications).
