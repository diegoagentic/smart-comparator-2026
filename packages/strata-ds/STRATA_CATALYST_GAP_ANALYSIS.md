# Strata vs. Catalyst vs. Tailwind UI - Gap Analysis

This document identifies UI components missing from the **Strata Design System** relative to the **Catalyst UI Kit** and **Tailwind UI** patterns, specifically focusing on **Tailwind CSS v4** alignment and **Ecommerce/Tracking** requirements.

## Master Component Comparison Matrix

This matrix tracks the alignment of **Strata Design System** components against its predecessor (**White Label**), the **Catalyst UI Kit** (Gold Standard), and the **Tailwind UI** ecosystem.

| Category | Component | White Label | Catalyst | Strata | Status | Origin |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **Forms** | Input / Textarea | ✅ | ✅ | ✅ | Aligned | Catalyst |
| | **Listbox** | ❌ | ✅ | **❌** | **Missing** | Catalyst |
| | **Combobox (Rich)** | ❌ | ✅ | ⚠️ | **Enhance** | Catalyst/TUI |
| | **Fieldset / Legend** | ❌ | ✅ | **❌** | **Missing** | Catalyst |
| **Ecommerce**| **Product Overview** | ❌ | ❌ | ❌ | **Missing** | **Tailwind (Custom)** |
| | **Product List** | ❌ | ❌ | ❌ | **Missing** | **Tailwind (Custom)** |
| | **Category Filters** | ❌ | ❌ | ❌ | **Missing** | **Tailwind (Custom)** |
| | **Shopping Cart** | ❌ | ❌ | ❌ | **Missing** | **Tailwind (Custom)** |
| | **Checkout Form** | ❌ | ❌ | ❌ | **Missing** | **Tailwind (Custom)** |
| | **Order Tracking** | ❌ | ❌ | ❌ | **Missing** | **Tailwind (Custom)** |
| **App UI** | **Disclosure** | ❌ | ✅ | ❌ | **Missing** | Catalyst/Headless |
| | **Empty States (Rich)**| ❌ | ❌ | ⚠️ | **Enhance** | **Tailwind (Custom)** |
| | **Flyout Menus** | ❌ | ✅ | ❌ | **Missing** | Catalyst/TUI |
| | **Step Indicators**| ❌ | ❌ | ❌ | **Missing** | **Tailwind (Custom)** |
| | **Command Palette** | ❌ | ✅ | ❌ | **Missing** | Catalyst |
| **Navigation** | Navbar / Sidebar | ✅ | ✅ | ✅ | Aligned | Catalyst |
| | Breadcrumb | ✅ | ❌ | ✅ | Aligned | Catalyst |
| | Pagination | ✅ | ✅ | ✅ | Aligned | Catalyst |
| **Layout** | **Card (Variants)** | ✅ | ❌ | ⚠️ | **Enhance** | **Tailwind (Custom)** |
| | App Shell | ✅ | ✅ | ✅ | Aligned | Catalyst |
| | **Banners (Custom)** | ❌ | ❌ | ❌ | **Missing** | **Tailwind (Custom)** |
| **Overlays** | Dialog / Modal | ✅ | ✅ | ✅ | Aligned | Catalyst |
| | **Popover (Rich)** | ✅ | ✅ | ⚠️ | **Enhance** | Catalyst |
| | **Dropdown (Rich)** | ✅ | ✅ | ⚠️ | **Enhance** | Catalyst |
| **Data Display**| **Description List** | ✅ | ✅ | ⚠️ | **Align** | Catalyst |
| | **Table (Advanced)** | ✅ | ✅ | ⚠️ | **Align** | Catalyst |
| | Stats / KPIs | ❌ | ❌ | ✅ | Aligned | **Tailwind (Custom)** |

## Detailed Gaps & Alignment Requirements

### 1. Ecommerce & Tracking (Personalizados)
- **Order Tracking**: Visual progress bars and status timelines for order fulfillment.
- **Product Architecture**: Highly customizable overviews and lists following TUI patterns.
- **Checkout Flows**: Multi-step checkout layouts with integrated form validation and summaries.

### 2. Advanced Interaction (Catalyst & Headless)
- **Disclosure**: Accessible accordion/toggled-content primitives.
- **Rich Overlays**: Enhancing Dropdowns and Popovers with icons, dividers, and multi-column layouts (Flyouts).
- **Comboboxes**: Multi-variant autocomplete with images, status indicators, and grouping.

### 3. Visual Content & Layout
- **Card Variants**: Expanding the base Card with specific presets for feature-rich content and dashboards.
- **Empty States**: Broadening the library from simple icons to interactive "Get Started" guide patterns.
- **Skeleton Screens**: Standardized low-level primitives for all upcoming complex blocks.

## Next Phase Proposal

Based on the expanded audit, we will prioritize:
1.  **Fieldset & Legend** (Core Forms)
2.  **Accessible Listbox & Combobox** (Advanced Forms)
3.  **Ecommerce: Product Overview & Tracking** (Vertical Specific)
4.  **Disclosure & Rich Overlays** (Interactions)
5.  **Skeleton Screens & Empty States** (Perceived Performance)
