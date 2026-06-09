# Component Library - Usage Guide

## Overview

The Strata Design System provides a comprehensive set of token-based React components. All components use CSS custom properties for styling, making them easily themeable and customizable.

## Foundations

### Color System

Strata uses a functional color system designed for clarity and hierarchy.

- **Volt Lime (`#D6FF3C`)**: The primary signal color. Used for active states, primary actions in dark mode, and high-priority indicators.
- **Monochrome**: A strict palette of Off-Black (`#0B0B0C`), Deep Graphite (`#1E1E22`), and Soft Gray (`#C8C8C8`) for structural elements.
- **Semantic Mapping**: Tokens like `--background`, `--foreground`, and `--primary` automatically shift between Light and Dark modes.

### Typography

- **Primary (Body)**: `Inter` is used for all UI text, ensuring high legibility at small sizes.
- **Brand (Display)**: `PP Monument Extended` is used for H1-H3 headers and feature titles to establish brand identity.

### Accessibility

- **Contrast**: Text on Volt Lime must always be **Black** (#000000) or **Off-Black** (#0B0B0C) to meet AAA contrast requirements.
- **Dark Mode**: All components support dark mode out of the box.

---

## Core Components

### Button

Versatile button component with 5 variants and 3 sizes.

```tsx
import { Button } from '@whitebrand/design-system';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button disabled>Disabled</Button>
```

**Customizable Tokens:**
- `--button-primary-background`
- `--button-primary-background-hover`
- `--button-primary-text`
- And more...

---

### Input

Form input component with size variants.

```tsx
import { Input } from '@whitebrand/design-system';

<Input placeholder="Enter text..." />
<Input inputSize="sm" placeholder="Small input" />
<Input inputSize="lg" placeholder="Large input" />
<Input type="email" placeholder="Email" />
<Input disabled placeholder="Disabled" />
```

**Customizable Tokens:**
- `--input-background`
- `--input-border`
- `--input-border-focus`
- `--input-text`
- `--input-placeholder`

---

### Card

Flexible container with composable sub-components.

```tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@whitebrand/design-system';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Padding variants
<Card padding="sm">Compact</Card>
<Card padding="md">Default</Card>
<Card padding="lg">Spacious</Card>
```

**Customizable Tokens:**
- `--card-background`
- `--card-border`
- `--card-border-radius`
- `--card-shadow`

---

### Badge

Small status indicators with semantic variants.

```tsx
import { Badge } from '@whitebrand/design-system';

<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

**Customizable Tokens:**
- `--badge-default-background`
- `--badge-success-background`
- `--badge-success-text`
- And more...

---

### Modal

Accessible dialog with overlay and composable parts.

```tsx
import { 
  Modal, 
  ModalHeader, 
  ModalTitle, 
  ModalDescription, 
  ModalContent, 
  ModalFooter 
} from '@whitebrand/design-system';

const [open, setOpen] = useState(false);

<Modal open={open} onClose={() => setOpen(false)} size="md">
  <ModalHeader>
    <ModalTitle>Modal Title</ModalTitle>
    <ModalDescription>Description text</ModalDescription>
  </ModalHeader>
  <ModalContent>
    <p>Modal content</p>
  </ModalContent>
  <ModalFooter>
    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
    <Button onClick={() => setOpen(false)}>Confirm</Button>
  </ModalFooter>
</Modal>

// Sizes
<Modal size="sm">...</Modal>
<Modal size="md">...</Modal>
<Modal size="lg">...</Modal>
<Modal size="xl">...</Modal>
```

**Customizable Tokens:**
- `--modal-background`
- `--modal-overlay`
- `--modal-shadow`
- `--modal-border-radius`

---

## Theme Customization

### Using ThemeProvider

Wrap your app or specific sections with `ThemeProvider` to customize tokens:

```tsx
import { ThemeProvider, Button } from '@whitebrand/design-system';

const customTheme = {
  '--button-primary-background': '#8B5CF6',
  '--button-primary-background-hover': '#7C3AED',
  '--button-primary-text': '#FFFFFF',
  '--card-border-radius': '12px',
};

<ThemeProvider theme={customTheme}>
  <Button variant="primary">Custom Themed Button</Button>
</ThemeProvider>
```

### Using CSS

Override tokens globally in your CSS:

```css
:root {
  --button-primary-background: #8B5CF6;
  --button-primary-background-hover: #7C3AED;
  --button-primary-text: #FFFFFF;
}

.dark {
  --button-primary-background: #A78BFA;
  --button-primary-background-hover: #8B5CF6;
}
```

### Using Inline Styles

Override tokens for specific components:

```tsx
<div style={{
  '--button-primary-background': '#FF6B6B',
  '--button-primary-text': 'white',
}}>
  <Button variant="primary">Red Button</Button>
</div>
```

---

## useTheme Hook

Programmatically access and modify theme tokens:

```tsx
import { useTheme } from '@whitebrand/design-system';

function MyComponent() {
  const { getTokenValue, setTokenValue } = useTheme();
  
  // Get current token value
  const primaryBg = getTokenValue('--button-primary-background');
  
  // Set token value
  const changeTheme = () => {
    setTokenValue('--button-primary-background', '#8B5CF6');
  };
  
  return <button onClick={changeTheme}>Change Theme</button>;
}
```

---

## TypeScript Support

All components are fully typed with TypeScript:

```tsx
import type { ButtonProps, InputProps, CardProps } from '@whitebrand/design-system';

// Component props are fully typed
const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

---

## Accessibility

All components follow accessibility best practices:

- Semantic HTML elements
- ARIA attributes where needed
- Keyboard navigation support
- Focus management
- Screen reader support

---

## Best Practices

1. **Use Semantic Variants**: Choose the variant that matches the semantic meaning (e.g., `destructive` for delete actions)

2. **Consistent Sizing**: Use the same size across related components for visual harmony

3. **Theme at Root Level**: Apply theme customizations at the root level when possible for consistency

4. **Compose Components**: Use sub-components (CardHeader, ModalFooter, etc.) for better structure

5. **Token Override**: Override tokens rather than adding custom CSS for better maintainability

---

## Examples

See `src/examples/ComponentShowcase.tsx` for comprehensive usage examples.

Run the showcase:
```bash
npm run dev
```

Then navigate to the showcase page to see all components in action with theming examples.
