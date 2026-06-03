---
name: Itinera Design System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#414752'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#717783'
  outline-variant: '#c1c6d4'
  surface-tint: '#005faf'
  primary: '#005dac'
  on-primary: '#ffffff'
  primary-container: '#1976d2'
  on-primary-container: '#fffdff'
  inverse-primary: '#a5c8ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#555c73'
  on-tertiary: '#ffffff'
  tertiary-container: '#6d758c'
  on-tertiary-container: '#fffdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a5c8ff'
  on-primary-fixed: '#001c3a'
  on-primary-fixed-variant: '#004786'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  status-pending: '#ED6C02'
  status-confirmed: '#2E7D32'
  status-completed: '#1976D2'
  status-cancelled: '#D32F2F'
  surface-border: '#E2E8F0'
  text-primary: '#1E293B'
  text-secondary: '#64748B'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  gutter-desktop: 24px
  gutter-mobile: 16px
  sidebar-width: 240px
  bottom-nav-height: 56px
  card-padding: 16px
---

## Brand & Style

The design system is built for a high-utility management environment, specifically tailored for sales representatives and administrators who require rapid data processing and status tracking. The brand personality is **Professional, Utilitarian, and Systematic**. It prioritizes function over form, ensuring that the interface never competes with the data it presents.

The chosen design style is **Corporate / Modern**. It leverages the reliability of the Material Design framework while introducing a refined density and a more sophisticated color application. The aesthetic focuses on clear information hierarchy, high-contrast status indicators, and a structured grid that facilitates efficient workflows across both desktop and mobile environments.

The visual language communicates reliability and precision through:
- **Logical Grouping:** Information is encapsulated in cards and distinct surface tiers.
- **Status-First Communication:** Color is used functionally to indicate the lifecycle of appointments.
- **Workflow Efficiency:** Minimizing cognitive load through consistent component behavior and familiar interaction patterns.

## Colors

This design system utilizes a functional color palette where hue is directly tied to the status and lifecycle of sales activities. The primary blue is used for interactive elements (CTAs, links) and the "Completed" final state, creating a visual link between action and resolution.

- **Primary (Blue):** The core interactive color and the marker for completed tasks.
- **Success (Green):** Specifically reserved for confirmed appointments and positive system feedback.
- **Warning (Amber):** Used for pending actions requiring representative attention.
- **Error (Red):** Denotes cancellations, system errors, or high-priority alerts.
- **Neutral (Slate/Gray):** A sophisticated range of cool grays provides the foundation for surfaces, borders, and typography, ensuring high legibility without the harshness of pure black.

The default mode is **Light**, optimized for clarity in various lighting conditions typical of on-the-go sales environments.

## Typography

The system uses **Inter** as the sole typeface to ensure maximum legibility and a systematic, clean aesthetic. The hierarchy is designed to support data-heavy interfaces, with a strong emphasis on label-to-body contrast.

- **Headlines:** Use tighter letter spacing and heavier weights to anchor pages and sections.
- **Body Text:** Optimized for reading notes and addresses; `body-md` is the standard for most interface text to maintain information density.
- **Labels & Captions:** Used for metadata (timestamps, file sizes) and status chips, often employing a semibold weight to ensure they remain distinct at small sizes.
- **Monospaced:** `JetBrains Mono` is used sparingly for technical IDs and database references to prevent character confusion.

## Layout & Spacing

The layout follows a **Fluid Grid** model with fixed-width navigation elements. The spacing rhythm is based on an **8px linear scale**, ensuring consistent alignment across all components.

### Grid & Containers
- **Desktop (Admin):** Features a persistent 240px sidebar on the left. The main content area uses a 12-column fluid grid with 24px gutters.
- **Mobile (Representative):** Uses a bottom navigation bar (56px height) and a single-column layout with 16px side margins.

### Breakpoints
- **Mobile (xs/sm):** < 600px. Content stacks vertically; use full-width cards.
- **Tablet (md):** 600px - 1200px. Transitions from bottom nav to side nav (clipped or temporary).
- **Desktop (lg+):** > 1200px. Standard sidebar layout with maximized data grid density.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Ambient Shadows**. This approach creates a sense of depth that helps users distinguish between the background, interactive content, and temporary overlays.

- **Level 0 (Background):** The base canvas uses the neutral color `#F8FAFC`.
- **Level 1 (Default Surface):** Cards and main content containers. These use a white background with a subtle, 1px border (`#E2E8F0`) and no shadow to keep the interface clean and flat.
- **Level 2 (Active/Raised):** Elements like "Notification Center" drawers and "Appointment Detail" sheets. These use soft, extra-diffused shadows (0px 4px 12px, 5% opacity black) to appear hovered over the base layout.
- **Level 3 (Modals/Dialogs):** Use a high-contrast shadow (0px 8px 24px, 12% opacity black) and a semi-transparent backdrop blur (4px) to focus user attention on critical actions.

## Shapes

The shape language is **Soft (Level 1)**, providing a modern feel that is professional but not overly rigid. 

- **Components:** Buttons, Input fields, and Cards utilize a `0.25rem` (4px) corner radius.
- **Status Chips:** Use a full pill-shape (radius of 999px) to distinguish them as non-interactive status indicators compared to standard buttons.
- **Avatars:** Strictly circular to differentiate user identities from data-heavy containers.
- **Drop Zones:** File upload areas use a dashed border with a 4px radius to indicate a distinct interaction zone.

## Components

The component library is an extension of **Material UI (MUI)**, customized to match the design system's tokens.

- **Buttons:** Primary buttons use the corporate blue. Secondary actions use an outlined style with `#475569`. Text buttons are reserved for low-priority actions within lists.
- **Status Chips:** These are the most critical visual cues. They must use the status-specific hex codes defined in the Colors section with a low-opacity background (10-15%) and high-contrast text.
- **Data Grids:** Prioritize row density. Use hairline dividers (`#E2E8F0`) and avoid heavy shadows on rows. Selection states should use a light blue tint.
- **Cards:** Cards should be used for KPIs on the dashboard and individual appointment summaries in mobile views. They should have a 1px border and 16px internal padding.
- **Input Fields:** Use the "Outlined" MUI style. The border should darken slightly on hover and use the primary blue for the active/focused state.
- **Timeline/Audit Trail:** A custom component representing the history of an appointment. Use a thin vertical line with small status-colored dots to indicate state transitions.
- **Navigation:**
    - **Desktop:** A fixed left sidebar with clear icon + label pairings.
    - **Mobile:** A bottom navigation bar for quick access to Home, Calendar, and Profile.