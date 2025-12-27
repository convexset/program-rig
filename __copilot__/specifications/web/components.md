# Web Components Guide

## Component Architecture

### Component Types

#### 1. Server Components (Default)
Default in Next.js App Router. Used for:
- Static content
- Data that doesn't need interactivity
- SEO-critical content

```tsx
// app/components/Header.tsx
export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4">
      <h1>My App</h1>
    </header>
  );
}
```

#### 2. Client Components
Used for interactivity. Add `'use client'` directive.

```tsx
// app/components/Counter.tsx
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

## Component Organization

```
components/
├── layout/              # Layout components
│   ├── VerticalContainer.tsx    # Stacks elements vertically
│   ├── HorizontalContainer.tsx  # Responsive horizontal layout
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Sidebar.tsx
├── ui/                  # Reusable UI components
│   ├── Rectangle.tsx            # Filled rectangle (decorative)
│   ├── VerticalSeparator.tsx    # Vertical spacing
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── Input.tsx
├── features/            # Feature-specific components
│   ├── ProgramExecutor.tsx      # Program execution orchestrator
│   ├── ProgramParser.tsx        # Program input & parsing
│   ├── ProgramScreen.tsx        # Screen display component
│   ├── ProgramElementGroup.tsx  # Group rendering component
│   ├── program-elements/        # Individual element renderers
│   │   ├── CyclicText.tsx
│   │   ├── YouTubeEmbed.tsx
│   │   ├── GroupCountdownTimer.tsx
│   │   ├── CenteredText.tsx
│   │   └── OverallProgressBar.tsx
│   ├── dashboard/
│   ├── auth/
│   └── profile/
└── shared/              # Shared utility components
    ├── Loading.tsx
    ├── ErrorBoundary.tsx
    └── NotFound.tsx
```

## Application-Specific Components

This application includes custom layout, UI, and feature components designed for specific use cases:

### Layout Components
- **VerticalContainer**: Stacks child elements vertically with configurable padding
- **HorizontalContainer**: Responsive grid layout that adapts to screen size

### UI Components
- **Rectangle**: Simple filled rectangle for layouts and placeholders
- **VerticalSeparator**: Provides vertical spacing between elements

### Feature Components (Program Execution)
- **ProgramExecutor**: Main orchestrator for program execution
- **ProgramParser**: Input and parsing interface for workout programs
- **ProgramScreen**: Displays a workout screen with timing
- **ProgramElementGroup**: Renders a group of exercises/elements
- **Program Elements**: Individual renderers for cyclic text, videos, timers, etc.

For detailed documentation:
- Layout/UI components: see [application-components.md](application-components.md)
- Program execution components: see [program-execution.md](program-execution.md)

## Component Patterns

For application-specific components (VerticalContainer, HorizontalContainer, Rectangle), see [application-components.md](application-components.md).

## Best Practices

1. **Use TypeScript**: Always define prop types with interfaces
2. **Single Responsibility**: Each component should do one thing well
3. **Composition over Configuration**: Build complex UIs from simple components
4. **Accessibility**: Use semantic HTML and ARIA attributes
5. **Performance**: 
   - Use `'use client'` only when necessary
   - Memoize expensive computations with `useMemo`
   - Memoize callbacks with `useCallback`
   - Lazy load heavy components
6. **Naming**: Use PascalCase for components, descriptive names
7. **File Structure**: One component per file
8. **Props**: Use destructuring and provide defaults
9. **Styling**: Use Tailwind utilities, keep inline styles minimal
10. **Error Handling**: Always handle loading and error states
