# Application-Specific Components

This document describes the custom components for the program-rig application.

## Configuration

All components reference the application configuration defined in `config/app-config.ts`. Default values for component props are stored in the `appConfig.components` namespace.

### AppConfig Interface

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
  components: {
    verticalContainer: {
      containerMargin: number;      // default: 0 - margin around entire container in px
      horizontalPadding: number;    // default: 2 - padding on left and right of child elements in px
      verticalPadding: number;      // default: 2 - padding on top and bottom of child elements in px
      alignment: 'left' | 'center' | 'right';  // default: 'center' - horizontal alignment of child elements (options: 'left', 'center', 'right')
    };
    horizontalContainer: {
      containerMargin: number;            // default: 0 - margin around entire container in px
      horizontalPadding: number;          // default: 2 - padding on left and right of child elements in px
      verticalPadding: number;            // default: 2 - padding on top and bottom of child elements in px
      elementsPerRowVeryLarge: number;    // default: 4 - elements per row on very large screens
      elementsPerRowLarge: number;        // default: 3 - elements per row on large screens
      elementsPerRowMedium: number;       // default: 2 - elements per row on medium screens
      elementsPerRowSmall: number;        // default: 2 - elements per row on small screens
      alignment: 'left' | 'center' | 'right';  // default: 'center' - horizontal alignment of child elements (options: 'left', 'center', 'right')
      width: number | undefined;          // default: undefined - width of container in px, undefined for auto width
    };
    rectangle: {
      width: number;                // default: 300 - width of rectangle in px
      height: number;               // default: 200 - height of rectangle in px
      borderColor: string;          // default: 'rgba(0,0,255,1)' - border color
      borderThickness: number;      // default: 1 - border thickness in px
      fillColor: string;            // default: 'rgba(0,0,255,0.95)' - fill color
    };
    verticalSeparator: {
      height: string;               // default: '2em' - height of vertical separator (CSS height value with unit)
    };
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
  components: {
    verticalContainer: {
      containerMargin: 0,
      horizontalPadding: 2,
      verticalPadding: 2,
      alignment: 'center',
    },
    horizontalContainer: {
      containerMargin: 0,
      horizontalPadding: 2,
      verticalPadding: 2,
      elementsPerRowVeryLarge: 4,
      elementsPerRowLarge: 3,
      elementsPerRowMedium: 2,
      elementsPerRowSmall: 2,
      alignment: 'center',
      width: undefined,
    },
    rectangle: {
      width: 300,
      height: 200,
      borderColor: 'rgba(0,0,255,1)',
      borderThickness: 1,
      fillColor: 'rgba(0,0,255,0.95)',
    },
    verticalSeparator: {
      height: '2em',
    },
  },
};
```

## Layout Components

### VerticalContainer

**Location**: `components/layout/VerticalContainer.tsx`

A container that stacks elements (from `children`) on top of each other with appropriate padding.

#### Props

```typescript
interface VerticalContainerProps {
  children: React.ReactNode;
  containerMargin?: number;      // default: from appConfig.components.verticalContainer.containerMargin
  horizontalPadding?: number;    // default: from appConfig.components.verticalContainer.horizontalPadding
  verticalPadding?: number;      // default: from appConfig.components.verticalContainer.verticalPadding
  alignment?: 'left' | 'center' | 'right';  // default: from appConfig.components.verticalContainer.alignment
}
```

**Parameters**:
- `children` (ReactNode; required): child elements to stack vertically
- `containerMargin` (integer; default from config: `0`): margin around entire container in px (applies to all sides)
- `horizontalPadding` (integer; default from config: `2`): padding on the left and right of child elements in px
- `verticalPadding` (integer; default from config: `2`): padding on the top and bottom of child elements in px
- `alignment` (string; default from config: `'center'`): horizontal alignment of child elements (options: `'left'`, `'center'`, `'right'`)

**Note**: Default values are sourced from `appConfig.components.verticalContainer`. Change the configuration to adjust defaults application-wide.

#### Features

- **Component Type**: Client component (`'use client'`) - needs configuration access
- **Element Borders**: Supports `dev.showElementBorders` configuration option (displays dotted black border when enabled)
- **Semantic HTML**: Uses `<section>` or `<div>` with appropriate ARIA attributes if needed
- **Styling**: Uses Tailwind CSS utilities and inline styles for dynamic values

#### Implementation Example

```tsx
'use client';

import React from 'react';
import { appConfig } from '@/config/app-config';

interface VerticalContainerProps {
  children: React.ReactNode;
  containerMargin?: number;
  horizontalPadding?: number;
  verticalPadding?: number;
  alignment?: 'left' | 'center' | 'right';
}

export default function VerticalContainer({
  children,
  containerMargin = appConfig.components.verticalContainer.containerMargin,
  horizontalPadding = appConfig.components.verticalContainer.horizontalPadding,
  verticalPadding = appConfig.components.verticalContainer.verticalPadding,
  alignment = appConfig.components.verticalContainer.alignment,
}: VerticalContainerProps) {
  const showBorders = appConfig.dev.showElementBorders;
  
  const getAlignItems = () => {
    switch (alignment) {
      case 'left':
        return 'flex-start';
      case 'right':
        return 'flex-end';
      case 'center':
      default:
        return 'center';
    }
  };
  
  return (
    <div
      className="flex flex-col"
      style={{
        margin: `${containerMargin}px`,
        border: showBorders ? '1px dotted black' : 'none',
        alignItems: getAlignItems(),
      }}
    >
      {React.Children.map(children, (child) => (
        <div
          style={{
            paddingLeft: `${horizontalPadding}px`,
            paddingRight: `${horizontalPadding}px`,
            paddingTop: `${verticalPadding}px`,
            paddingBottom: `${verticalPadding}px`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
```

#### Accessibility

- Use semantic `<section>` or `<div>`
- Consider `role="region"` if it represents a landmark
- Add `aria-label` if the region needs a descriptive name

---

### HorizontalContainer

**Location**: `components/layout/HorizontalContainer.tsx`

A responsive container that places elements (from `children`) horizontally side by side with appropriate padding.

#### Props

```typescript
interface HorizontalContainerProps {
  children: React.ReactNode;
  containerMargin?: number;               // default: from appConfig.components.horizontalContainer.containerMargin
  horizontalPadding?: number;             // default: from appConfig.components.horizontalContainer.horizontalPadding
  verticalPadding?: number;               // default: from appConfig.components.horizontalContainer.verticalPadding
  elementsPerRowVeryLarge?: number;       // default: from appConfig.components.horizontalContainer.elementsPerRowVeryLarge
  elementsPerRowLarge?: number;           // default: from appConfig.components.horizontalContainer.elementsPerRowLarge
  elementsPerRowMedium?: number;          // default: from appConfig.components.horizontalContainer.elementsPerRowMedium
  elementsPerRowSmall?: number;           // default: from appConfig.components.horizontalContainer.elementsPerRowSmall
  alignment?: 'left' | 'center' | 'right';  // default: from appConfig.components.horizontalContainer.alignment
  width?: number;                         // default: from appConfig.components.horizontalContainer.width
}
```

**Parameters**:
- `children` (ReactNode; required): child elements to arrange horizontally
- `containerMargin` (integer; default from config: `0`): margin around entire container in px (applies to all sides)
- `horizontalPadding` (integer; default from config: `2`): padding on the left and right of child elements in px
- `verticalPadding` (integer; default from config: `2`): padding on the top and bottom of child elements in px
- `elementsPerRowVeryLarge` (integer; default from config: `4`): elements per row when the detected device size is "very large"
- `elementsPerRowLarge` (integer; default from config: `3`): elements per row when the detected device size is "large"
- `elementsPerRowMedium` (integer; default from config: `2`): elements per row when the detected device size is "medium"
- `elementsPerRowSmall` (integer; default from config: `2`): elements per row when the detected device size is "small"
- `alignment` (string; default from config: `'center'`): horizontal alignment of child elements (options: `'left'`, `'center'`, `'right'`)
- `width` (integer or undefined; default from config: `undefined`): width of container in px, `undefined` for auto width

**Note**: Default values are sourced from `appConfig.components.horizontalContainer`. Change the configuration to adjust defaults application-wide.

#### Responsive Breakpoints

The breakpoints are based on the configuration using min-width media queries:

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

#### Features

- **Component Type**: Client component (`'use client'`) - needs responsive breakpoint detection and window resize handling
- **Element Borders**: Supports `dev.showElementBorders` configuration option (displays dotted black border when enabled)
- **Layout**: Uses Flexbox for responsive layout with separate rows
- **Wrapping**: Automatically wraps elements to new rows when needed, with each row independently aligned
- **Alignment**: Each row is independently aligned left, center, or right based on the `alignment` prop
- **Semantic HTML**: Uses `<section>` or `<div>` with appropriate ARIA attributes if needed

#### Implementation Example

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { appConfig } from '@/config/app-config';

interface HorizontalContainerProps {
  children: React.ReactNode;
  containerMargin?: number;
  horizontalPadding?: number;
  verticalPadding?: number;
  elementsPerRowVeryLarge?: number;
  elementsPerRowLarge?: number;
  elementsPerRowMedium?: number;
  elementsPerRowSmall?: number;
  alignment?: 'left' | 'center' | 'right';
  width?: number | string;
}

export default function HorizontalContainer({
  children,
  containerMargin = appConfig.components.horizontalContainer.containerMargin,
  horizontalPadding = appConfig.components.horizontalContainer.horizontalPadding,
  verticalPadding = appConfig.components.horizontalContainer.verticalPadding,
  elementsPerRowVeryLarge = appConfig.components.horizontalContainer.elementsPerRowVeryLarge,
  elementsPerRowLarge = appConfig.components.horizontalContainer.elementsPerRowLarge,
  elementsPerRowMedium = appConfig.components.horizontalContainer.elementsPerRowMedium,
  elementsPerRowSmall = appConfig.components.horizontalContainer.elementsPerRowSmall,
  alignment = appConfig.components.horizontalContainer.alignment,
  width = appConfig.components.horizontalContainer.width,
}: HorizontalContainerProps) {
  const [columns, setColumns] = useState(elementsPerRowSmall);
  const showBorders = appConfig.dev.showElementBorders;

  const getJustifyContent = () => {
    switch (alignment) {
      case 'left':
        return 'flex-start';
      case 'right':
        return 'flex-end';
      case 'center':
      default:
        return 'center';
    }
  };

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      
      if (width >= appConfig.view.breakpointVeryLarge) {
        setColumns(elementsPerRowVeryLarge);
      } else if (width >= appConfig.view.breakpointLarge) {
        setColumns(elementsPerRowLarge);
      } else if (width >= appConfig.view.breakpointMedium) {
        setColumns(elementsPerRowMedium);
      } else {
        setColumns(elementsPerRowSmall);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [elementsPerRowVeryLarge, elementsPerRowLarge, elementsPerRowMedium, elementsPerRowSmall]);

  // Split children into rows based on columns
  const childrenArray = React.Children.toArray(children);
  const rows: React.ReactNode[][] = [];
  for (let i = 0; i < childrenArray.length; i += columns) {
    rows.push(childrenArray.slice(i, i + columns));
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: `${verticalPadding}px`,
        margin: `${containerMargin}px`,
        border: showBorders ? '1px dotted black' : 'none',
        width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : 'auto',
      }}
    >
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'flex',
            justifyContent: getJustifyContent(),
            gap: `${horizontalPadding}px`,
          }}
        >
          {row.map((child, childIndex) => (
            <div key={childIndex}>
              {child}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
      {children}
    </div>
  );
}
```

#### Accessibility

- Use semantic `<section>` or `<div>`
- Consider `role="list"` with children as `role="listitem"` if semantically a list
- Ensure proper reading order when wrapping occurs
- Ensure touch targets are at least 44x44px on mobile

---

## UI Components

### Rectangle

**Location**: `components/ui/Rectangle.tsx`

A filled rectangle with no margin. Purely decorative element.

#### Props

```typescript
interface RectangleProps {
  width?: number;                // default: from appConfig.components.rectangle.width
  height?: number;               // default: from appConfig.components.rectangle.height
  borderColor?: string;          // default: from appConfig.components.rectangle.borderColor
  borderThickness?: number;      // default: from appConfig.components.rectangle.borderThickness
  fillColor?: string;            // default: from appConfig.components.rectangle.fillColor
}
```

**Parameters**:
- `width` (integer; default from config: `300`): width of rectangle in px
- `height` (integer; default from config: `200`): height of rectangle in px
- `borderColor` (string or RGBA string; default from config: `rgba(0,0,255,1)`): border color (fully opaque)
- `borderThickness` (integer; default from config: `1`): border thickness in px
- `fillColor` (string or RGBA string; default from config: `rgba(0,0,255,0.95)`): fill color (slightly transparent)

**Note**: Default values are sourced from `appConfig.components.rectangle`. Change the configuration to adjust defaults application-wide.

#### Features

- **Component Type**: Server component (default) - purely presentational, no interactivity
- **Rendering**: Renders as a `<div>` with inline styles or CSS classes
- **Accessibility**: Includes `role="presentation"` (decorative element)
- **Spacing**: No margin applied (parent containers handle spacing)

#### Implementation Example

```tsx
import { appConfig } from '@/config/app-config';

interface RectangleProps {
  width?: number;
  height?: number;
  borderColor?: string;
  borderThickness?: number;
  fillColor?: string;
}

export default function Rectangle({
  width = appConfig.components.rectangle.width,
  height = appConfig.components.rectangle.height,
  borderColor = appConfig.components.rectangle.borderColor,
  borderThickness = appConfig.components.rectangle.borderThickness,
  fillColor = appConfig.components.rectangle.fillColor,
}: RectangleProps) {
  return (
    <div
      role="presentation"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: fillColor,
        border: `${borderThickness}px solid ${borderColor}`,
        boxSizing: 'border-box',
      }}
    />
  );
}
```

#### Accessibility

- Use `role="presentation"` or `aria-hidden="true"` (purely decorative)
- No interactive elements within
- Should not interfere with screen reader navigation
- Color contrast exempt (decorative element)

---

### VerticalSeparator

**Location**: `components/ui/VerticalSeparator.tsx`

A vertical spacer element for adding vertical spacing between components.

#### Props

```typescript
interface VerticalSeparatorProps {
  height?: string;  // default: from appConfig.components.verticalSeparator.height
}
```

**Parameters**:
- `height` (string; default from config: `'2em'`): height of the vertical separator (CSS height value with unit, e.g., `'2em'`, `'20px'`, `'1rem'`)

**Note**: Default value is sourced from `appConfig.components.verticalSeparator`. Change the configuration to adjust default application-wide.

#### Features

- **Component Type**: Server component (default) - purely presentational, no interactivity
- **Rendering**: Renders as an empty `<div>` with specified height
- **Accessibility**: Includes `role="presentation"` (decorative spacer element)
- **Spacing**: Provides vertical spacing between elements

#### Implementation Example

```tsx
import { appConfig } from '@/config/app-config';

interface VerticalSeparatorProps {
  height?: string;
}

export default function VerticalSeparator({
  height = appConfig.components.verticalSeparator.height,
}: VerticalSeparatorProps) {
  return (
    <div
      role="presentation"
      style={{
        height: height,
      }}
    />
  );
}
```

#### Accessibility

- Use `role="presentation"` or `aria-hidden="true"` (purely decorative spacer)
- No interactive elements within
- Should not interfere with screen reader navigation
- Provides visual spacing only

---

## File Structure

```
web/
├── app/
│   └── page.tsx                    # Root route implementation
├── components/
│   ├── layout/
│   │   ├── VerticalContainer.tsx
│   │   └── HorizontalContainer.tsx
│   └── ui/
│       ├── Rectangle.tsx
│       └── VerticalSeparator.tsx
└── config/
    └── app-config.ts               # Application configuration
```

## Usage Example

### Root Route (app/page.tsx)

```tsx
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

## Styling Guidelines

- **Tailwind CSS**: Use utilities where possible for static styles
- **Inline Styles**: Use for dynamic values (colors, dimensions, responsive calculations)
- **CSS Grid/Flexbox**: Preferred for layout containers
- **Responsive Design**: Use window resize listeners and breakpoints from config
- **Configuration**: Always reference `appConfig` for breakpoints and dev settings

## Accessibility Checklist

- [ ] Semantic HTML elements used appropriately
- [ ] ARIA roles and attributes added where needed
- [ ] Decorative elements marked with `role="presentation"` or `aria-hidden="true"`
- [ ] Keyboard navigation works (if interactive)
- [ ] Touch targets are at least 44x44px on mobile
- [ ] Content reflows properly at all viewport sizes
- [ ] Screen reader testing completed
- [ ] Color contrast meets WCAG AA (for text-containing elements)

## Testing

### Manual Testing
1. Test at all breakpoint sizes (small, medium, large, very large)
2. Enable `dev.showElementBorders` to verify layout
3. Test with screen readers
4. Verify responsive behavior on resize

### Unit Testing (Future)
- Test component rendering with different props
- Test responsive breakpoint logic
- Test configuration access
- Test accessibility attributes
