# Routing Guide

## Next.js App Router

Next.js 13+ uses a file-system based router built on React Server Components. The routing structure is defined by the folder structure in the `app/` directory.

## Current Application Routes

### Root Route (/)

**File**: `app/page.tsx`

The homepage uses custom layout components:

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

## Basic Routing Concepts

### File Structure Pattern

```
app/
├── page.tsx              # / (home page)
├── layout.tsx            # Root layout (applies to all pages)
├── loading.tsx           # Loading UI (optional)
├── error.tsx             # Error UI (optional)
└── [additional-routes]/  # Future routes
```

### Root Layout (Required)

```tsx
// app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'Program Rig',
  description: 'Program Rig Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

## Navigation

### Link Component

For client-side navigation between pages:

```tsx
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
    </nav>
  );
}
```

### Programmatic Navigation

```tsx
'use client';

import { useRouter } from 'next/navigation';

export default function MyComponent() {
  const router = useRouter();
  
  const handleNavigate = () => {
    router.push('/');
  };
  
  return <button onClick={handleNavigate}>Go Home</button>;
}
```

## Error Handling

### Error UI

```tsx
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Something went wrong!
      </h2>
      <p className="mb-4">{error.message}</p>
      <button 
        onClick={reset}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Try again
      </button>
    </div>
  );
}
```

### Not Found

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold mb-4">404 - Page Not Found</h2>
      <p>Could not find requested resource</p>
      <a href="/" className="text-blue-600 hover:underline">
        Return Home
      </a>
    </div>
  );
}
```

## Static Export Considerations

Since this app uses static export (`output: 'export'` in next.config.js):

### Trailing Slashes

The configuration includes `trailingSlash: true` for S3 compatibility:

```javascript
// next.config.js
{
  output: 'export',
  trailingSlash: true,
}
```

This ensures URLs like `/about` become `/about/` with an `index.html` file, which works properly with S3 static hosting.

### Limitations

- No API routes (use external API via AWS Chalice)
- No dynamic server-side rendering
- No incremental static regeneration
- All routes must be known at build time

## Best Practices

1. **Use Link Component**: Always use `<Link>` for internal navigation
2. **Error Boundaries**: Add `error.tsx` for graceful error handling  
3. **Not Found**: Provide custom 404 page with `not-found.tsx`
4. **TypeScript**: Type your page params properly
5. **Static Export**: Remember all pages are pre-rendered at build time
