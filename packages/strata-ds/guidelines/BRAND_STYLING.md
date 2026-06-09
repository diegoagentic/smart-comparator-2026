# Brand Styling Rules

This document outlines the strict styling rules for "Branded" components, specifically Cards and Primary Actions, within the Strata Design System.

## Core Principles

The system adapts its expression between Light and Dark modes to ensure accessibility and visual hierarchy.

| Mode | Theme Strategy | Background | Primary Action |
| :--- | :--- | :--- | :--- |
| **Light** | **Clean / Brand Soft** | `bg-white` | `bg-brand-300` (#E6F993) |
| **Dark** | **Brand Signal** | `bg-zinc-900` | `bg-brand-500` (#C3E433) |

---

## Component: Branded Card

### Light Mode
In light mode, branded cards should maintain a clean, collaborative feel. Avoid heavy colored backgrounds to preserve legibility.

*   **Background:** `bg-white` (Standard)
*   **Primary Action:** `bg-brand-300` (Lime)
    *   *Rule:* Use `brand-300` as the primary interaction color in light mode.
*   **Text:** `text-zinc-900` (Primary), `text-zinc-500` (Secondary)
*   **Accents:** Use `brand-400` for subtle decorative elements (e.g., top borders, icon containers).

**Example Code:**
```tsx
<Card className="bg-white border-zinc-200">
  <div className="h-1 bg-brand-400" /> {/* Accent */}
  <Button className="bg-brand-300 text-zinc-900 hover:bg-brand-400">
    Action
  </Button>
</Card>
```

### Dark Mode
In dark mode, the strategy shifts to "Brand Signal". We use deep backgrounds to make the brand color "pop" as a signal light.

*   **Background:** `bg-zinc-900` (Deep Dark)
*   **Primary Action:** `bg-brand-500` (#C3E433) (Lime High Contrast)
    *   *Rule:* Use `brand-500` for maximum contrast and visibility against dark surfaces.
*   **Text:** `text-white` (Primary), `text-zinc-400` (Secondary)
*   **Accents:** `brand-400` (#DAF75F) can be used for subtle highlights, borders and decorative elements. Use `brand-500` for primary interactive elements.

**Example Code:**
```tsx
<Card className="bg-zinc-900 border-zinc-800">
  <div className="h-1 bg-brand-400" /> {/* Accent */}
  <Button className="bg-brand-500 text-zinc-900 hover:bg-brand-600">
    Action
  </Button>
</Card>
```
