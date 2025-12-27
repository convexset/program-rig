# Background

Refer `starter.md` for information 

# Objective

Update the specifications for the web application to reflect the application structure here, and update the documentation accordingly.

Create specifications for TypeScript interfaces based on these.

# Web Application Configuration

The application should have a configuration file (`config/app-config.ts`) with the following TypeScript structure:

```typescript
interface AppConfig {
  dev: {
    showElementBorders: boolean;  // default: false - displays dotted black outer borders of components supporting this option if true
  };
  view: {
    breakpointVeryLarge: number;  // default: 1200 - breakpoint for very large screens (min-width in px)
    breakpointLarge: number;      // default: 992 - breakpoint for large screens (min-width in px)
    breakpointMedium: number;     // default: 576 - breakpoint for medium screens (min-width in px)
  };
}

export const appConfig: AppConfig = {
  dev: {
    showElementBorders: false,
  },
  view: {
    breakpointVeryLarge: 1200,
    breakpointLarge: 992,
    breakpointMedium: 576,
  },
};
```


# Web Application Routes

## Route: /

**File**: `app/page.tsx`

Navigation to the root should lead to the display of the following components:

- `VerticalContainer`
  * `Rectangle`
  * `HorizontalContainer`
    * `Rectangle`
    * `Rectangle`
    * `Rectangle`
  * `Rectangle`
  * `HorizontalContainer`
    * `Rectangle`
    * `Rectangle`
    * `Rectangle`
    * `Rectangle`
    * `Rectangle`
    * `Rectangle`
    * `Rectangle`

**Implementation Example**:

```tsx
// app/page.tsx
import VerticalContainer from '@/components/layout/VerticalContainer';
import HorizontalContainer from '@/components/layout/HorizontalContainer';
import Rectangle from '@/components/ui/Rectangle';

export default function HomePage() {
  return (
    <VerticalContainer>
      <Rectangle />
      <HorizontalContainer>
        <Rectangle />
        <Rectangle />
        <Rectangle />
      </HorizontalContainer>
      <Rectangle />
      <HorizontalContainer>
        <Rectangle />
        <Rectangle />
        <Rectangle />
        <Rectangle />
        <Rectangle />
        <Rectangle />
        <Rectangle />
      </HorizontalContainer>
    </VerticalContainer>
  );
}
```

# Component Reference

## `VerticalContainer`

A container that stacks elements (from `children`) on top of each other with appropriate padding.

**Props**:
- `children` (ReactNode; required): child elements to stack vertically
- `containerMargin` (integer; default: `0`): margin around entire container in px (applies to all sides)
- `horizontalPadding` (integer; default: `2`): padding on the left and right of child elements in px
- `verticalPadding` (integer; default: `2`): padding on the top and bottom of child elements in px

**TypeScript Interface**:
```typescript
interface VerticalContainerProps {
  children: React.ReactNode;
  containerMargin?: number;      // default: 0
  horizontalPadding?: number;    // default: 2
  verticalPadding?: number;      // default: 2
}
```

**Features**:
- Should be a client component ('use client')
- Should support the `dev.showElementBorders` configuration option (displays dotted black border when enabled)
- Should use semantic HTML (`<section>` or `<div>` with appropriate ARIA attributes if needed)

## `HorizontalContainer`

A responsive container that places elements (from `children`) horizontally side by side with appropriate padding.

**Props**:
- `children` (ReactNode; required): child elements to arrange horizontally
- `containerMargin` (integer; default: `0`): margin around entire container in px (applies to all sides)
- `horizontalPadding` (integer; default: `2`): padding on the left and right of child elements in px
- `verticalPadding` (integer; default: `2`): padding on the top and bottom of child elements in px
- `elementsPerRowVeryLarge` (integer; default: `4`): elements per row when the detected device size is "very large"
- `elementsPerRowLarge` (integer; default: `3`): elements per row when the detected device size is "large"
- `elementsPerRowMedium` (integer; default: `2`): elements per row when the detected device size is "medium"
- `elementsPerRowSmall` (integer; default: `2`): elements per row when the detected device size is "small"

**TypeScript Interface**:
```typescript
interface HorizontalContainerProps {
  children: React.ReactNode;
  containerMargin?: number;               // default: 0
  horizontalPadding?: number;             // default: 2
  verticalPadding?: number;               // default: 2
  elementsPerRowVeryLarge?: number;       // default: 4
  elementsPerRowLarge?: number;           // default: 3
  elementsPerRowMedium?: number;          // default: 2
  elementsPerRowSmall?: number;           // default: 2
}
```

**Responsive Breakpoints**:

The breakpoints should be based on the configuration using min-width media queries:
- **small**: 0px to (view.breakpointMedium - 1)px
- **medium**: view.breakpointMedium to (view.breakpointLarge - 1)px
- **large**: view.breakpointLarge to (view.breakpointVeryLarge - 1)px
- **very large**: view.breakpointVeryLarge and above

```typescript
// Example breakpoint logic
@media (min-width: ${config.view.breakpointMedium}px) { /* medium */ }
@media (min-width: ${config.view.breakpointLarge}px) { /* large */ }
@media (min-width: ${config.view.breakpointVeryLarge}px) { /* very large */ }
```

**Features**:
- Should be a client component ('use client') due to responsive breakpoint detection
- Should support the `dev.showElementBorders` configuration option (displays dotted black border when enabled)
- Should use CSS Grid or Flexbox for responsive layout
- Should wrap elements to new rows when needed
- Should use semantic HTML (`<section>` or `<div>` with appropriate ARIA attributes if needed)


## `Rectangle`

A filled rectangle with no margin.

**Props**:
- `width` (integer; default: `300`): width of rectangle in px
- `height` (integer; default: `200`): height of rectangle in px
- `borderColor` (string or RGBA string; default: `rgba(0,0,128,1)`): border color (fully opaque)
- `borderThickness` (integer; default: `1`): border thickness in px
- `fillColor` (string or RGBA string; default: `rgba(0,0,255,0.95)`): fill color (slightly transparent)

**TypeScript Interface**:
```typescript
interface RectangleProps {
  width?: number;                // default: 300
  height?: number;               // default: 200
  borderColor?: string;          // default: 'rgba(0,0,255,1)'
  borderThickness?: number;      // default: 1
  fillColor?: string;            // default: 'rgba(0,0,255,0.95)'
}
```

**Features**:
- Can be a server component (no interactivity needed)
- Should render as a `<div>` with inline styles or CSS classes
- Should include `role="presentation"` for accessibility (decorative element)
- No margin applied (parent containers handle spacing)


# Implementation Notes

## File Structure

Components should be created in the following structure:

```
web/
├── app/
│   └── page.tsx                    # Root route implementation
├── components/
│   ├── layout/
│   │   ├── VerticalContainer.tsx
│   │   └── HorizontalContainer.tsx
│   └── ui/
│       └── Rectangle.tsx
└── config/
    └── app-config.ts               # Application configuration
```

## Configuration Access

Components should access configuration via direct import:

```typescript
import { appConfig } from '@/config/app-config';

// Usage in component
const showBorders = appConfig.dev.showElementBorders;
const breakpoint = appConfig.view.breakpointLarge;
```

## Client vs Server Components

- **`VerticalContainer`**: Client component ('use client') - needs configuration access
- **`HorizontalContainer`**: Client component ('use client') - needs responsive breakpoint detection and window resize handling
- **`Rectangle`**: Server component (default) - purely presentational, no interactivity

## Styling Approach

- Use Tailwind CSS utilities where possible
- Use inline styles for dynamic values (colors, dimensions)
- Use CSS-in-JS or styled-components for complex responsive logic if needed


# Accessibility Requirements

## General Guidelines

1. **Semantic HTML**: Use appropriate HTML elements
   - Containers: Use `<section>`, `<div>`, or `<article>` as appropriate
   - Add `role` attributes when semantic meaning is important

2. **ARIA Attributes**:
   - Containers with multiple items: Consider `role="list"` and `role="listitem"`
   - Decorative elements (Rectangle): Use `role="presentation"` or `aria-hidden="true"`

3. **Keyboard Navigation**:
   - Ensure all interactive elements are keyboard accessible
   - No keyboard traps

4. **Color Contrast**:
   - Border and fill colors should meet WCAG AA standards if containing text
   - Decorative elements (Rectangle) are exempt but should still be distinguishable

5. **Responsive Design**:
   - Ensure touch targets are at least 44x44px on mobile
   - Test with screen readers
   - Ensure content reflows properly at different viewport sizes

## Component-Specific Requirements

### VerticalContainer
- Use semantic `<section>` or `<div>`
- Consider `role="region"` if it represents a landmark
- Add `aria-label` if the region needs a descriptive name

### HorizontalContainer
- Use semantic `<section>` or `<div>`
- Consider `role="list"` with children as `role="listitem"` if semantically a list
- Ensure proper reading order when wrapping occurs

### Rectangle
- Use `role="presentation"` or `aria-hidden="true"` (purely decorative)
- No interactive elements within
- Should not interfere with screen reader navigation
