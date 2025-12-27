# Web Application Overview

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Type**: Static Site Generation (SSG) / Static Export
- **Deployment**: AWS S3 + CloudFront

## Project Structure

```
web/
├── app/                    # App Router (Next.js 13+)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (ProgramExecutor)
│   ├── globals.css        # Global styles
│   └── [routes]/          # Additional routes
├── components/            # Reusable React components
│   ├── layout/           # Layout components (VerticalContainer, HorizontalContainer)
│   ├── ui/               # UI components (Rectangle, VerticalSeparator)
│   ├── features/         # Feature-specific components
│   │   ├── ProgramExecutor.tsx      # Main execution orchestrator
│   │   ├── ProgramParser.tsx        # Program input & parsing
│   │   ├── ProgramScreen.tsx        # Screen display
│   │   ├── ProgramElementGroup.tsx  # Group rendering
│   │   └── [elements]/              # Individual part renderers
│   └── shared/           # Shared utility components
├── config/                # Application configuration
│   └── app-config.ts     # Central app config (breakpoints, dev, settings)
├── lib/                   # Utility functions, API clients
│   ├── parsers/          # Program parsing logic
│   ├── validators/       # Program validation
│   └── utils/            # Time formatting, YouTube ID extraction
├── types/                 # TypeScript type definitions
│   └── program.ts        # Program interfaces (ProgramDefinition, Screen, Group, Part)
├── public/                # Static assets
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
└── tailwind.config.ts     # Tailwind CSS configuration
```

## Key Features

### Program Execution System
Core functionality for fitness class management:
- **Program Parser**: Markdown-like syntax for defining workout programs
- **Program Executor**: State management and timing synchronization
- **Live Display**: Real-time workout screen with groups, timers, and progress tracking
- **Multi-Screen Support**: Different workout variations with screen selection
- **State Management**: LocalStorage or API-based state synchronization

See [program-execution.md](program-execution.md) for detailed documentation.

### Static Export
The application uses Next.js static export (`output: 'export'`) to generate a pure static site that can be hosted on S3.

### Build Output
- **Development**: `../web-build/dev/`
- **Production**: `../web-build/prod/`

The build output directory is configured via `distDir` in `next.config.js` and controlled by `NODE_ENV`.

### API Integration
The web application is a pure front-end with no backend logic. API calls can be made to external services:

- API base URL configured via environment variables
- Uses `axios` or `fetch` for HTTP requests
- Client-side data fetching
- Optional API-based state synchronization for program execution

### Application Configuration

The application uses a centralized configuration file at `config/app-config.ts` for:
- Development settings (element borders for debugging)
- Responsive breakpoints (small, medium, large, very large)
- Program execution settings (duration limits, polling intervals)

See [configuration.md](configuration.md) for details.

### Environment Variables

Create `.env.local` for local development:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000  # Local Chalice dev server
```

Create `.env.production` for production builds:

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com  # Production API Gateway URL
```

## Configuration

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for S3
  distDir: process.env.NODE_ENV === 'production' 
    ? '../web-build/prod' 
    : '../web-build/dev',
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
  },
}

module.exports = nextConfig
```

### Key Configuration Options

- **output: 'export'**: Generates static HTML/CSS/JS files
- **distDir**: Custom build output directory
- **trailingSlash: true**: Adds trailing slashes to URLs (S3 compatibility)
- **images.unoptimized: true**: Disables Next.js Image Optimization API (not available in static export)

## Development

### Local Development Server

```bash
npm run dev
```

Runs on `http://localhost:3000`

### Building

```bash
# Development build
npm run build:dev

# Production build
npm run build:prod
```

### Testing Build Output

```bash
# After building, serve the static files locally
npx serve ../web-build/dev
# or
npx serve ../web-build/prod
```

## Styling

### Tailwind CSS
- Utility-first CSS framework
- Configured in `tailwind.config.ts`
- Global styles in `app/globals.css`

### Custom Styles
- Use Tailwind utilities when possible
- Component-specific CSS modules for complex styling
- Consistent design system

## API Client

### Example API Client (lib/api.ts)

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export default apiClient;
```

## Deployment Flow

1. **Build**: `npm run build:prod` generates static files in `../web-build/prod/`
2. **Deploy**: CDK deployment script syncs `web-build/prod/` to S3
3. **Invalidate**: CloudFront cache invalidation for new content
4. **Access**: Users access via CloudFront distribution URL

## Best Practices

1. **Use Server Components** where possible (default in App Router)
2. **Client Components** only when needed (interactivity, hooks, browser APIs)
3. **Environment Variables** must be prefixed with `NEXT_PUBLIC_` to be accessible in browser
4. **Static Export Limitations**:
   - No API Routes
   - No Server-Side Rendering (SSR)
   - No Incremental Static Regeneration (ISR)
   - No Image Optimization API
5. **Type Safety**: Use TypeScript for all components and utilities
6. **Code Splitting**: Leverage Next.js automatic code splitting
7. **Performance**: Optimize images, lazy load components, minimize bundle size

## Limitations of Static Export

Since this is a pure front-end application using static export:

- ❌ No API routes (`app/api/`)
- ❌ No dynamic SSR (`getServerSideProps`)
- ❌ No ISR (`revalidate`)
- ❌ No middleware
- ✅ Client-side routing works
- ✅ Client-side data fetching works
- ✅ All React hooks work
- ✅ Can use external APIs (via Chalice API)

## Testing

### Unit Tests (when implemented)
```bash
npm run test
```

### E2E Tests (when implemented)
```bash
npm run test:e2e
```

## Common Commands

```bash
# Development
npm run dev

# Build for development
npm run build:dev

# Build for production
npm run build:prod

# Lint
npm run lint

# Format (if configured)
npm run format
```
