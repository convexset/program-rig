# Web Application Configuration

## Overview

The web application uses a centralized configuration file for application-wide settings including development features and responsive breakpoints.

## Configuration File

**Location**: `config/app-config.ts`

## Type Definition

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
  settings: {
    groupDurationLimitInSeconds: number;  // default: 7200 - maximum allowed duration for program groups in seconds
    maxWidth: number;  // default: 800 - maximum width for program screen display in px
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
```

## Default Configuration

```typescript
export const appConfig: AppConfig = {
  dev: {
    showElementBorders: false,
  },
  view: {
    breakpointVeryLarge: 1200,
    breakpointLarge: 992,
    breakpointMedium: 576,
  },
  settings: {
    groupDurationLimitInSeconds: 7200,
    maxWidth: 800,
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

## Configuration Sections

### Development Settings (`dev`)

Settings for development and debugging purposes.

#### `showElementBorders`

- **Type**: `boolean`
- **Default**: `false`
- **Purpose**: When enabled, displays dotted black outer borders on components that support this feature
- **Supported Components**: `VerticalContainer`, `HorizontalContainer`
- **Usage**: Useful for debugging layout issues and understanding component boundaries

**Example**:
```typescript
// To enable borders during development
export const appConfig: AppConfig = {
  dev: {
    showElementBorders: true, // Set to true for debugging
  },
  // ...
};
```

### Application Settings (`settings`)

Global application settings that affect program execution behavior.

#### `groupDurationLimitInSeconds`

- **Type**: `number` (seconds)
- **Default**: `7200` (2 hours)
- **Purpose**: Maximum allowed total duration for workout program screens
- **Usage**: Used by ProgramParser to validate program definitions
- **Validation**: Programs exceeding this limit will be rejected during parsing

#### `maxWidth`

- **Type**: `number` (pixels)
- **Default**: `800`
- **Purpose**: Maximum width for program screen display
- **Usage**: Used by ProgramScreen component with VerticalContainer to constrain display width
- **Effect**: Ensures consistent viewing experience across different screen sizes

**Example**:
```typescript
export const appConfig: AppConfig = {
  settings: {
    groupDurationLimitInSeconds: 7200, // 2 hours max
    maxWidth: 800, // 800px max width for program display
  },
  // ...
};
```

### View Settings (`view`)

Settings related to responsive design and viewport breakpoints.

#### Breakpoint System

The application uses a 4-tier breakpoint system based on min-width media queries:

| Screen Size   | Range                                    | Breakpoint Setting       |
|---------------|------------------------------------------|--------------------------|
| Small         | 0px to (breakpointMedium - 1)px         | N/A (default)            |
| Medium        | breakpointMedium to (breakpointLarge - 1)px | `breakpointMedium`    |
| Large         | breakpointLarge to (breakpointVeryLarge - 1)px | `breakpointLarge`  |
| Very Large    | breakpointVeryLarge and above            | `breakpointVeryLarge`    |

#### `breakpointMedium`

- **Type**: `number` (pixels)
- **Default**: `576`
- **Purpose**: Minimum width for medium-sized screens
- **Common Use**: Tablets in portrait mode

#### `breakpointLarge`

- **Type**: `number` (pixels)
- **Default**: `992`
- **Purpose**: Minimum width for large screens
- **Common Use**: Tablets in landscape mode, smaller desktops

#### `breakpointVeryLarge`

- **Type**: `number` (pixels)
- **Default**: `1200`
- **Purpose**: Minimum width for very large screens
- **Common Use**: Desktop monitors, large displays

### Component Settings (`components`)

Centralized default values for all application components. Components use these values when props are not explicitly provided.

#### `verticalContainer`

Default values for the `VerticalContainer` component:

- **`containerMargin`**: `0` - Margin around entire container in px
- **`horizontalPadding`**: `2` - Padding on left and right of child elements in px
- **`verticalPadding`**: `2` - Padding on top and bottom of child elements in px
- **`alignment`**: `'center'` - Horizontal alignment of child elements (options: `'left'`, `'center'`, `'right'`)

#### `horizontalContainer`

Default values for the `HorizontalContainer` component:

- **`containerMargin`**: `0` - Margin around entire container in px
- **`horizontalPadding`**: `2` - Padding on left and right of child elements in px
- **`verticalPadding`**: `2` - Padding on top and bottom of child elements in px
- **`elementsPerRowVeryLarge`**: `4` - Elements per row on very large screens
- **`elementsPerRowLarge`**: `3` - Elements per row on large screens
- **`elementsPerRowMedium`**: `2` - Elements per row on medium screens
- **`elementsPerRowSmall`**: `2` - Elements per row on small screens
- **`alignment`**: `'center'` - Horizontal alignment of child elements (options: `'left'`, `'center'`, `'right'`)
- **`width`**: `undefined` - Width of container in px, `undefined` for auto width

#### `rectangle`

Default values for the `Rectangle` component:

- **`width`**: `300` - Width of rectangle in px
- **`height`**: `200` - Height of rectangle in px
- **`borderColor`**: `'rgba(0,0,255,1)'` - Border color (fully opaque blue)
- **`borderThickness`**: `1` - Border thickness in px
- **`fillColor`**: `'rgba(0,0,255,0.95)'` - Fill color (slightly transparent blue)

#### `verticalSeparator`

Default values for the `VerticalSeparator` component:

- **`height`**: `'2em'` - Height of vertical separator (CSS height value with unit)

**Example - Customizing Component Defaults**:
```typescript
export const appConfig: AppConfig = {
  // ... other settings
  components: {
    rectangle: {
      width: 400,                        // Larger default width
      height: 300,                       // Larger default height
      borderColor: 'rgba(255,0,0,1)',    // Red border
      borderThickness: 2,                // Thicker border
      fillColor: 'rgba(255,0,0,0.9)',    // Red fill
    },
    // ... other components
  },
};
```

## Accessing Configuration

### In Client Components

```typescript
'use client';

import { appConfig } from '@/config/app-config';

export default function MyComponent() {
  // Access development settings
  const showBorders = appConfig.dev.showElementBorders;
  
  // Access breakpoints
  const mediumBreakpoint = appConfig.view.breakpointMedium;
  const largeBreakpoint = appConfig.view.breakpointLarge;
  const veryLargeBreakpoint = appConfig.view.breakpointVeryLarge;
  
  // Access component defaults
  const defaultWidth = appConfig.components.rectangle.width;
  const defaultPadding = appConfig.components.verticalContainer.horizontalPadding;
  
  // Use in component logic
  return (
    <div style={{ border: showBorders ? '1px dotted black' : 'none' }}>
      {/* Component content */}
    </div>
  );
}
```

### In Responsive Logic

```typescript
'use client';

import { useState, useEffect } from 'react';
import { appConfig } from '@/config/app-config';

export default function ResponsiveComponent() {
  const [screenSize, setScreenSize] = useState<'small' | 'medium' | 'large' | 'very large'>('small');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      
      if (width >= appConfig.view.breakpointVeryLarge) {
        setScreenSize('very large');
      } else if (width >= appConfig.view.breakpointLarge) {
        setScreenSize('large');
      } else if (width >= appConfig.view.breakpointMedium) {
        setScreenSize('medium');
      } else {
        setScreenSize('small');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return <div>Current screen size: {screenSize}</div>;
}
```

### In CSS-in-JS

```typescript
import { appConfig } from '@/config/app-config';

const styles = {
  container: {
    width: '100%',
    [`@media (min-width: ${appConfig.view.breakpointMedium}px)`]: {
      width: '80%',
    },
    [`@media (min-width: ${appConfig.view.breakpointLarge}px)`]: {
      width: '70%',
    },
    [`@media (min-width: ${appConfig.view.breakpointVeryLarge}px)`]: {
      width: '60%',
    },
  },
};
```

## Customization

### Changing Breakpoints

To customize breakpoints for your project:

```typescript
export const appConfig: AppConfig = {
  dev: {
    showElementBorders: false,
  },
  view: {
    breakpointVeryLarge: 1440,  // Larger desktops
    breakpointLarge: 1024,      // Standard desktops
    breakpointMedium: 768,      // Tablets
  },
  components: {
    // Keep existing component defaults or customize them
    // ...
  },
};
```

### Customizing Component Defaults

To change default component values application-wide:

```typescript
export const appConfig: AppConfig = {
  // ... other settings
  components: {
    verticalContainer: {
      containerMargin: 10,        // Add margin around all vertical containers
      horizontalPadding: 8,       // Increase horizontal padding
      verticalPadding: 8,         // Increase vertical padding
    },
    horizontalContainer: {
      containerMargin: 10,
      horizontalPadding: 8,
      verticalPadding: 8,
      elementsPerRowVeryLarge: 6, // More elements on very large screens
      elementsPerRowLarge: 4,     // More elements on large screens
      elementsPerRowMedium: 3,    // More elements on medium screens
      elementsPerRowSmall: 2,     // Keep default for small screens
    },
    rectangle: {
      width: 400,                        // Larger rectangles
      height: 300,
      borderColor: 'rgba(0,128,0,1)',    // Green border
      borderThickness: 2,
      fillColor: 'rgba(0,128,0,0.85)',   // Green fill
    },
  },
};
```

### Environment-Specific Configuration

For different configurations per environment:

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

export const appConfig: AppConfig = {
  dev: {
    showElementBorders: isDevelopment, // Auto-enable in development
  },
  view: {
    breakpointVeryLarge: 1200,
    breakpointLarge: 992,
    breakpointMedium: 576,
  },
  components: {
    // Use smaller rectangles in development for testing
    rectangle: {
      width: isDevelopment ? 200 : 300,
      height: isDevelopment ? 150 : 200,
      borderColor: 'rgba(0,0,255,1)',
      borderThickness: isDevelopment ? 2 : 1,  // Thicker borders in dev
      fillColor: 'rgba(0,0,255,0.95)',
    },
    // ... other components
  },
};
```

## Best Practices

1. **Centralized Configuration**: Keep all app-wide settings in this single file
2. **Type Safety**: Always use the `AppConfig` interface for type checking
3. **Consistency**: Use the same breakpoint values throughout the application
4. **Documentation**: Document any custom breakpoints or settings
## Best Practices

1. **Centralized Configuration**: Keep all app-wide settings in this single file
2. **Type Safety**: Always use the `AppConfig` interface for type checking
3. **Consistency**: Use the same breakpoint values throughout the application
4. **Documentation**: Document any custom breakpoints or settings
5. **Default Values**: Always provide sensible defaults in the `components` namespace
6. **Environment Awareness**: Use environment variables for environment-specific settings
7. **Component Defaults**: Change `appConfig.components` values instead of hardcoding in components
8. **Per-Instance Overrides**: Use component props only when you need instance-specific values
9. **Testing**: Test components at all breakpoint boundaries with both default and custom values

## Common Breakpoint Reference

Standard breakpoint values for reference:

| Device Type          | Width Range      | Suggested Breakpoint |
|---------------------|------------------|---------------------|
| Mobile (Portrait)    | 320px - 576px    | N/A (small)         |
| Mobile (Landscape)   | 576px - 768px    | 576px (medium)      |
| Tablet (Portrait)    | 768px - 992px    | 768px (medium)      |
| Tablet (Landscape)   | 992px - 1200px   | 992px (large)       |
| Desktop              | 1200px - 1920px  | 1200px (very large) |
| Large Desktop        | 1920px+          | 1200px (very large) |

## Migration Guide

If updating from a different breakpoint system:

1. Identify current breakpoint values in your CSS/Tailwind config
2. Map them to the new configuration structure
3. Update all components to use `appConfig` instead of hardcoded values
4. Test responsive behavior at all breakpoints
5. Update documentation

## Troubleshooting

### Breakpoints Not Working

- Ensure component is a client component (`'use client'`)
- Verify `window.addEventListener('resize')` is properly set up
- Check that configuration is imported correctly
- Verify breakpoint values are in ascending order

### Borders Not Showing

- Ensure `showElementBorders` is set to `true`
- Verify component supports this feature
- Check that component is reading configuration correctly
- Inspect element in browser dev tools for applied styles

### Component Defaults Not Applied

- Verify component is importing `appConfig` correctly
- Check that default parameter values reference `appConfig.components.*`
- Ensure TypeScript is not throwing type errors
- Clear Next.js cache and rebuild if changes aren't reflected
