# CLAUDE.md - Frontend

This file provides guidance to Claude Code when working with the frontend application in this repository.

## Overview

This is a React 19 frontend application built with:
- **React**: 19.2.0 with modern features (Suspense, Transitions, Server Components patterns)
- **Build Tool**: Vite 7 with SWC for fast compilation
- **Router**: React Router 7
- **Data Fetching**: TanStack Query + oRPC Client
- **Forms**: React Hook Form for form state management and validation
- **State Management**: Zustand for global/central state
- **UI Library**: Material-UI via `@connected-repo/ui-mui` package
- **Validation**: Zod schemas from `@connected-repo/zod-schemas`
- **Authentication**: Better Auth integration

## React 19 Best Practices

### 1. Use Modern React Patterns

- **Actions and useTransition:**
- **use() Hook for Promises:**
- **Suspense for Data Fetching:**

### 2. Avoid Unnecessary useEffect

React 19 emphasizes reducing `useEffect` usage. Prefer:
- **Direct calculations** in render instead of synchronizing state
- **Event handlers** for user interactions
- **use()** hook for promises
- **TanStack Query** for data fetching (already integrated)

**Bad:**
```tsx
const [filteredUsers, setFilteredUsers] = useState([]);

useEffect(() => {
  setFilteredUsers(users.filter(u => u.active));
}, [users]);
```

**Good:**
```tsx
const filteredUsers = users.filter(u => u.active);
```

### 3. Optimize Re-renders

**Use React.memo sparingly** - Only for expensive components:
```tsx
import { memo } from 'react';

const ExpensiveList = memo(function ExpensiveList({ items }) {
  // Complex rendering logic
});
```

**Prefer composition over memo:**
```tsx
// Extract static content to parent
function Parent() {
  const [state, setState] = useState();

  return (
    <div>
      <ExpensiveComponent /> {/* Won't re-render when state changes */}
      <DynamicComponent state={state} />
    </div>
  );
}
```

### 4. Type Safety with TypeScript

Always use proper TypeScript types - **NEVER use `any` or `as unknown`**:

## Architecture and Module Organization

### Directory Structure

```
src/
├── components/          # Shared components (prefer ui-mui package)
├── modules/            # Feature modules (auth, dashboard, etc.)
│   └── auth/
│       ├── pages/      # Auth-specific pages
│       └── auth.router.tsx  # Module routes
├── utils/              # Utilities (oRPC client, query client)
├── configs/            # Configuration files
├── router.tsx          # Main application router
├── App.tsx             # Root component
└── main.tsx            # Entry point
```

### Modular Structure Rules

#### 1. Keep Modules Self-Contained

Each module should be independent with its own:
- Pages
- Routes
- Module-specific components (if needed)
- Business logic

**Example structure for a new module:**
```
modules/
└── dashboard/
    ├── pages/
    │   ├── DashboardHome.page.tsx
    │   └── Analytics.page.tsx
    ├── dashboard.router.tsx
    └── hooks/
        └── useDashboardData.ts
```

#### 2. NO Cross-Module Component Imports

**NEVER import components directly from other modules:**

```tsx
// ✗ BAD - Direct cross-module import
import { AuthHeader } from '../auth/components/AuthHeader';

// ✓ GOOD - Use lazy loading if needed
const AuthHeader = lazy(() => import('../auth/components/AuthHeader'));

// ✓ BETTER - Move shared component to ui-mui package
import { Header } from '@connected-repo/ui-mui/components';
```

#### 3. Use Lazy Loading for Route-Level Code Splitting

**Always use `React.lazy()` for page components:**

#### 4. Module Router Pattern

Each feature module should export its own router:

## Component Development Guidelines

### 1. Use UI-MUI Package for All Reusable Components

**The `@connected-repo/ui-mui` package is the source of truth for all shared UI components.**

**When to create a component in ui-mui:**
- Component used in multiple pages/modules
- Common UI patterns (buttons, cards, forms, etc.)
- Design system components
- Styled Material-UI components

**Create new components in ui-mui:**

**Use direct imports (not barrel exports) for better tree-shaking:**

### 2. Frontend Component Naming Conventions

- **Pages**: `PageName.moduleName.page.tsx` (e.g., `Login.auth.page.tsx`)
- **Components**: `ComponentName.moduleName.tsx` (e.g., `UserList.auth.tsx`)
- **Module-specific**: `ComponentName.moduleName.tsx` (e.g., `AuthVerifier.auth.tsx`)

### 3. Component Best Practices

- **Keep components small and focused:**
- **Use composition for flexibility:**

## Form Management with React Hook Form
### Best Practices

1. **Always use Zod resolver** for consistent validation across frontend and backend
2. **Leverage `formState`** for loading, error, and dirty states
3. **Reset forms** after successful submission with `reset()`
4. **Handle backend errors** using `setError()` to map backend errors to form fields
5. **Use `watch()` sparingly** - it can cause re-renders. Prefer `getValues()` when you don't need reactivity
6. **Type forms properly** using Zod inferred types from `@connected-repo/zod-schemas`

## State Management with Zustand
 
### Overview

**Use Zustand for global/central state management.** Zustand is 
lightweight, simple, and works seamlessly with React 19.

**When to use Zustand:**
- Global application state (user session, theme, settings)
- Shared state across multiple modules/pages
- State that persists across route changes
- Complex state that doesn't belong in URL params or server cache

**When NOT to use Zustand:**
- Server state (use oRPC + TanStack Query instead)
- Form state (use React Hook Form instead)
- URL state (use React Router state/params instead)
- Component-local state (use React useState/useReducer instead)

### Best Practices

1. **Organize stores by domain** - Create separate stores for different features (auth, cart, settings, etc.)
2. **Use selectors** to prevent unnecessary re-renders by selecting only needed state
3. **Keep actions in the store** - Don't put business logic in components
4. **Use middleware wisely** - `persist` for state that should survive refreshes, `immer` for complex nested updates
5. **Type everything** - Always define TypeScript interfaces for your stores
6. **Don't mix with server state** - Use oRPC/TanStack Query for server data, Zustand for UI state
7. **Avoid deep nesting** - Keep state flat when possible for better performance
8. **Use slices** for large stores to maintain organization

## oRPC Client Usage

### Type-Safe API Calls

The frontend automatically gets types from the backend router (`apps/backend/src/router.ts`).

### Authentication Integration

- Better Auth client for Google OAuth
- Session management with secure state handling
- Automatic token refresh and session validation

### Error Handling

Use error boundaries for component-level error handling:

## Performance Optimization

### Code Splitting Strategy

**1. Route-level splitting (automatic with lazy):**

**2. Component-level splitting (for heavy components) with lazy loading:**

### Avoid Unnecessary Re-renders

**1. Use React Query's built-in optimizations:**

**2. Memoize expensive calculations:**

## Backend Router Alignment

### Understanding Backend Modular Structure

The backend router (`apps/backend/src/router.ts`) uses nested routers (plain objects) for organization

### When Adding New Features

**1. Backend creates modular router:**
```typescript
// apps/backend/src/router.ts
export const router = {
  // Existing routers...

  // New feature module
  dashboard: {
    getMetrics: protectedProcedure.handler(...),
    getAnalytics: protectedProcedure.handler(...),
  },
};

export type BackendRouter = RouterClient<typeof router>;
```

**2. Frontend automatically gets types and creates matching module:**
```
modules/dashboard/
├── pages/
│   └── DashboardHome.page.tsx  # Uses orpc.dashboard.getMetrics.useQuery()
└── dashboard.router.tsx         # Lazy-loaded routes
```

## Environment Variables

- Frontend environment variables must be prefixed with `VITE_`
- Access via `import.meta.env`

## Design & User Experience Principles

**CRITICAL: All UI development must prioritize beautiful, tasteful design with smooth, easy, and delightful user experience.**

### Core Design Philosophy

1. **Beauty First**: Every interface should be visually appealing with attention to detail
2. **Smooth Interactions**: All transitions and animations should feel natural and fluid
3. **Easy to Use**: Users should intuitively understand how to interact with every element
4. **Delightful Experience**: Small touches that make users smile and enjoy using the app
5. **Consistent Polish**: Every pixel matters - maintain high quality throughout

### Visual Design Excellence

#### 1. Color and Visual Hierarchy

**Use color purposefully and tastefully:**
```tsx
// ✓ GOOD - Purposeful color usage
<Box sx={{
  bgcolor: 'background.paper',          // Subtle backgrounds
  borderLeft: '4px solid',
  borderColor: 'primary.main',          // Accent colors for emphasis
  color: 'text.primary',                // High contrast text
}}>
  <Typography variant="h6" color="primary.main">
    Important Title
  </Typography>
  <Typography variant="body2" color="text.secondary">
    Supporting text with appropriate hierarchy
  </Typography>
</Box>

// ✗ BAD - Harsh, overwhelming colors
<Box sx={{ bgcolor: '#ff0000', color: '#ffff00' }}>
  <Typography>Hard to read!</Typography>
</Box>
```

**Visual hierarchy best practices:**
- Use subtle color variations, not harsh contrasts
- Primary actions use `primary.main`, secondary use `text.secondary`
- Backgrounds: `background.default` → `background.paper` for elevation
- Borders: Use `divider` color for subtle separation
- Success/error states: Use semantic colors (`success.main`, `error.main`)

#### 2. Typography and Readability

**Beautiful typography creates trust and readability:**
```tsx
import { Typography } from '@connected-repo/ui-mui/data-display/Typography';

// Use appropriate variants for hierarchy
<Stack spacing={2}>
  <Typography variant="h3" fontWeight={600} color="text.primary">
    Clear, Bold Headlines
  </Typography>

  <Typography variant="body1" color="text.secondary" lineHeight={1.7}>
    Body text should be comfortable to read with generous line height.
    Never compromise on readability for aesthetics.
  </Typography>

  <Typography variant="caption" color="text.disabled">
    Subtle supporting information
  </Typography>
</Stack>
```

**Typography guidelines:**
- Line height: 1.5-1.7 for body text (better readability)
- Letter spacing: Use default or subtle adjustments (-0.01em for headings)
- Font weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Never use all caps for long text
- Maintain 60-80 characters per line for optimal readability

#### 3. Spacing and Whitespace

**Generous, consistent spacing creates breathing room:**
```tsx
// ✓ GOOD - Generous, harmonious spacing
<Stack spacing={3}>
  <Card sx={{ p: 3, mb: 4 }}>
    <Typography variant="h5" mb={2}>Title</Typography>
    <Typography variant="body1" mb={3}>Content with room to breathe</Typography>
    <Button>Action</Button>
  </Card>
</Stack>

// ✗ BAD - Cramped, uneven spacing
<Card sx={{ p: 1 }}>
  <Typography variant="h5">Title</Typography>
  <Typography variant="body1">Cramped content</Typography>
  <Button>Action</Button>
</Card>
```

**Spacing guidelines:**
- Use theme spacing (8px base unit): `spacing={2}` = 16px, `spacing={3}` = 24px
- Related elements: 1-2 spacing units (8-16px)
- Section separation: 3-4 spacing units (24-32px)
- Card/container padding: minimum 2-3 spacing units (16-24px)
- Don't be afraid of whitespace - it improves focus and clarity

#### 4. Elevation and Depth

**Subtle shadows create depth without distraction:**
```tsx
// Subtle elevation for cards and raised elements
<Paper
  elevation={0}
  sx={{
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }
  }}
>
  <Content />
</Paper>

// Use elevation for layering
<Dialog>  {/* Highest elevation */}
  <DialogContent>
    <Paper elevation={1}>  {/* Nested elevation */}
      <Content />
    </Paper>
  </DialogContent>
</Dialog>
```

**Elevation best practices:**
- Default state: elevation 0-1 (subtle or no shadow)
- Hover state: elevation 2-4 (noticeable lift)
- Active/focused: elevation 6-8 (significant lift)
- Modals/dialogs: elevation 16-24 (clear separation from background)

### Smooth User Experience

#### 1. Animations and Transitions

**Every interaction should feel smooth and responsive:**
```tsx
import { Button } from '@connected-repo/ui-mui/form/Button';
import { Fade } from "@connected-repo/ui-mui/feedback/Fade";
import { Grow } from "@connected-repo/ui-mui/feedback/Slide";
import { Slide } from "@connected-repo/ui-mui/feedback/Slide";

// Smooth transitions on state changes
<Button
  sx={{
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: 4,
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  }}
>
  Hover Me
</Button>

// Entrance animations for new content
<Fade in={true} timeout={300}>
  <Card>New content appears smoothly</Card>
</Fade>

// Page transitions
<Slide direction="left" in={true} timeout={200}>
  <Box>Page content slides in</Box>
</Slide>
```

**Animation guidelines:**
- Duration: 150-300ms for most transitions (quick but noticeable)
- Easing: `ease-in-out` for most, `ease-out` for entrances, `ease-in` for exits
- Subtle is better: 2-4px transforms, gentle opacity changes
- Never animate: layout shifts (use transforms instead)
- Always provide: reduced motion support via `prefers-reduced-motion`

```tsx
// Respect user preferences for reduced motion
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

<Box
  sx={{
    transition: prefersReducedMotion ? 'none' : 'all 0.2s ease-in-out',
  }}
/>
```

#### 2. Loading States

**Loading states should be elegant and informative:**
```tsx
import { CircularProgress } from '@connected-repo/ui-mui/feedback/CircularProgress';
import { Skeleton } from '@connected-repo/ui-mui/feedback/Skeleton';
import { LinearProgress } from '@connected-repo/ui-mui/feedback/LinearProgress';

// Skeleton screens for content loading (preferred)
{isLoading ? (
  <Stack spacing={2}>
    <Skeleton variant="text" width="60%" height={32} />
    <Skeleton variant="rectangular" height={200} />
    <Skeleton variant="text" width="80%" />
  </Stack>
) : (
  <ActualContent />
)}

// Inline loading for actions
<Button disabled={isLoading}>
  {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
  {isLoading ? 'Saving...' : 'Save'}
</Button>

// Page-level loading
{isLoading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0 }} />}
```

**Loading state guidelines:**
- Use skeleton screens for initial page loads (better UX than spinners)
- Show inline loaders for button actions
- Display progress bars for known-duration operations
- Always disable buttons during async operations
- Provide feedback within 100ms of user action

#### 3. Feedback and Micro-interactions

**Immediate feedback for every user action:**
```tsx
import { Snackbar } from '@connected-repo/ui-mui/feedback/Snackbar';
import { Alert } from '@connected-repo/ui-mui/feedback/Alert';

// Success feedback
const handleSave = async () => {
  try {
    await saveData();
    setSnackbar({
      open: true,
      message: 'Saved successfully! ✓',
      severity: 'success'
    });
  } catch (error) {
    setSnackbar({
      open: true,
      message: 'Failed to save. Please try again.',
      severity: 'error'
    });
  }
};

// Hover effects for interactivity
<Card
  sx={{
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 6,
      borderColor: 'primary.main',
    },
  }}
>
```

**Feedback principles:**
- Acknowledge every user action within 100ms
- Use success/error colors appropriately (green/red)
- Provide clear, friendly error messages
- Show hover states on all interactive elements
- Add ripple effects on buttons and clickable items (built-in to MUI)

#### 4. Form Experience

**Forms should be easy, forgiving, and helpful:**
```tsx
import { TextField } from '@connected-repo/ui-mui/form/TextField';
import { FormHelperText } from '@connected-repo/ui-mui/form/FormHelperText';

// Helpful, inline validation
<TextField
  label="Email Address"
  type="email"
  error={!!errors.email}
  helperText={errors.email || "We'll never share your email"}
  fullWidth
  sx={{
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused': {
        '& fieldset': {
          borderWidth: 2,  // Thicker border on focus
          borderColor: 'primary.main',
        },
      },
    },
  }}
/>

// Inline validation with smooth transitions
<Fade in={!!errors.password}>
  <Alert severity="error" sx={{ mt: 1 }}>
    Password must be at least 8 characters
  </Alert>
</Fade>

// Success states
<TextField
  label="Username"
  InputProps={{
    endAdornment: isValid && <CheckCircleIcon color="success" />,
  }}
/>
```

**Form UX guidelines:**
- Validate on blur, not on every keystroke (less annoying)
- Show success states, not just errors
- Provide helpful placeholder examples
- Use appropriate input types (email, tel, number)
- Auto-focus first field on page load
- Never reset forms on validation errors
- Group related fields together
- Use clear, action-oriented button labels

### Delightful Details

#### 1. Empty States

**Empty states should be inviting and helpful:**
```tsx
<Box
  sx={{
    textAlign: 'center',
    py: 8,
    px: 3,
  }}
>
  <Box
    component="img"
    src="/empty-state.svg"
    sx={{
      width: 200,
      height: 200,
      opacity: 0.6,
      mb: 3,
    }}
  />
  <Typography variant="h5" color="text.primary" gutterBottom>
    No projects yet
  </Typography>
  <Typography variant="body1" color="text.secondary" mb={3}>
    Create your first project to get started
  </Typography>
  <Button variant="contained" size="large">
    Create Project
  </Button>
</Box>
```

#### 2. Error States

**Errors should be friendly and actionable:**
```tsx
<Alert
  severity="error"
  sx={{
    borderRadius: 2,
    '& .MuiAlert-icon': {
      fontSize: 28,
    },
  }}
  action={
    <Button color="inherit" size="small" onClick={retry}>
      Try Again
    </Button>
  }
>
  <AlertTitle>Couldn't load your data</AlertTitle>
  We're having trouble connecting. Check your internet and try again.
</Alert>
```

#### 3. Success Celebrations

**Celebrate user achievements:**
```tsx
// Subtle success animation
<Grow in={showSuccess}>
  <Alert
    severity="success"
    sx={{
      animation: 'pulse 0.5s ease-in-out',
      '@keyframes pulse': {
        '0%, 100%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.02)' },
      },
    }}
  >
    <AlertTitle>Welcome aboard! 🎉</AlertTitle>
    Your account has been created successfully
  </Alert>
</Grow>
```

### Consistency and Polish

#### 1. Design Tokens

**Use theme tokens consistently:**
```tsx
// ✓ GOOD - Use theme values
<Box sx={{
  borderRadius: 2,              // theme.shape.borderRadius * 2
  bgcolor: 'background.paper',  // theme.palette.background.paper
  color: 'text.primary',        // theme.palette.text.primary
  p: 3,                         // theme.spacing(3)
}}>

// ✗ BAD - Magic numbers and hardcoded values
<Box sx={{
  borderRadius: '12px',
  bgcolor: '#ffffff',
  color: '#333333',
  padding: '24px',
}}>
```

#### 2. Component Reusability

**Create consistent, reusable patterns:**
```tsx
// Define common component patterns
const ActionCard = ({ title, description, icon, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      p: 3,
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      border: '1px solid',
      borderColor: 'divider',
      '&:hover': {
        borderColor: 'primary.main',
        transform: 'translateY(-4px)',
        boxShadow: 4,
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      {icon}
      <Typography variant="h6" ml={2}>{title}</Typography>
    </Box>
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
  </Card>
);
```

### Accessibility Meets Beauty

**Beautiful design should be accessible to everyone:**
```tsx
// Color contrast: minimum 4.5:1 for normal text
<Typography
  variant="body1"
  color="text.primary"  // High contrast
>
  Readable text
</Typography>

// Focus indicators
<Button
  sx={{
    '&:focus-visible': {
      outline: '3px solid',
      outlineColor: 'primary.main',
      outlineOffset: 2,
    },
  }}
>
  Accessible Button
</Button>

// ARIA labels for icons
<IconButton aria-label="Delete item">
  <DeleteIcon />
</IconButton>
```

### Design Checklist

Before marking any UI complete, ensure:

- [ ] **Visual Appeal**: Is it beautiful and tastefully designed?
- [ ] **Color Harmony**: Do colors work well together and serve a purpose?
- [ ] **Typography**: Is text hierarchy clear and readable?
- [ ] **Spacing**: Is there generous, consistent whitespace?
- [ ] **Transitions**: Do interactions feel smooth (200-300ms)?
- [ ] **Hover States**: Do all interactive elements have hover feedback?
- [ ] **Loading States**: Are loading experiences elegant?
- [ ] **Empty States**: Are they helpful and inviting?
- [ ] **Error States**: Are they friendly and actionable?
- [ ] **Success Feedback**: Is positive feedback delightful?
- [ ] **Consistency**: Does it match the rest of the app's design?
- [ ] **Accessibility**: Is it usable by everyone (contrast, focus states)?
- [ ] **Performance**: Do animations run at 60fps?
- [ ] **Polish**: Have you sweated the small details?

## Responsive Design Requirements

**CRITICAL: All UI development must be highly responsive across desktop, tablet, and mobile devices.**

### 1. Mobile-First Approach

Always design and develop with mobile devices as the primary target, then enhance for larger screens:

```tsx
// ✓ GOOD - Mobile-first styling
<Box
  sx={{
    padding: 2,           // Mobile: 16px
    md: { padding: 3 },   // Tablet: 24px
    lg: { padding: 4 },   // Desktop: 32px
  }}
>
```

### 2. Material-UI Breakpoints

Use MUI's breakpoint system consistently:

- **xs**: 0px (mobile phones)
- **sm**: 600px (large phones, small tablets)
- **md**: 900px (tablets)
- **lg**: 1200px (laptops, desktops)
- **xl**: 1536px (large desktops)

**Breakpoint usage in sx prop:**
```tsx
<Typography
  variant="h1"
  sx={{
    fontSize: '1.5rem',      // Mobile
    sm: { fontSize: '2rem' }, // Tablet
    md: { fontSize: '2.5rem' }, // Desktop
  }}
/>
```

### 3. Responsive Layout Components

**Grid System:**
```tsx
import { Grid } from '@connected-repo/ui-mui/layout/Grid';

<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4}>
    {/* Full width on mobile, half on tablet, third on desktop */}
  </Grid>
</Grid>
```

**Stack with Responsive Direction:**
```tsx
import { Stack } from '@connected-repo/ui-mui/layout/Stack';

<Stack
  direction={{ xs: 'column', md: 'row' }}
  spacing={{ xs: 2, md: 3 }}
>
  {/* Vertical on mobile, horizontal on desktop */}
</Stack>
```

**Container with Responsive Max Width:**
```tsx
import { Container } from '@connected-repo/ui-mui/layout/Container';

<Container maxWidth="lg">
  {/* Automatically responsive to screen size */}
</Container>
```

### 4. Responsive Typography

```tsx
import { Typography } from '@connected-repo/ui-mui/data-display/Typography';

// MUI variants automatically scale, but customize when needed
<Typography
  variant="h1"
  sx={{
    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
    lineHeight: { xs: 1.2, md: 1.3 },
  }}
/>
```

### 5. Touch-Friendly Interactions

**Minimum tap target size: 44x44px for mobile:**
```tsx
<Button
  sx={{
    minHeight: 44,
    minWidth: 44,
    padding: { xs: '12px 24px', md: '8px 16px' }, // Larger padding on mobile
  }}
/>
```

### 6. Responsive Tables and Data Display

**For tables, use responsive strategies:**
```tsx
// Option 1: Horizontal scroll on mobile
<Box sx={{ overflowX: 'auto' }}>
  <Table sx={{ minWidth: 650 }} />
</Box>

// Option 2: Card layout on mobile, table on desktop
{isMobile ? <UserCards /> : <UserTable />}
```

### 7. Hide/Show Based on Screen Size

```tsx
import { Box } from '@connected-repo/ui-mui/layout/Box';

// Show only on mobile
<Box sx={{ display: { xs: 'block', md: 'none' } }}>
  <MobileMenu />
</Box>

// Show only on desktop
<Box sx={{ display: { xs: 'none', md: 'block' } }}>
  <DesktopMenu />
</Box>
```

### 8. Testing Responsive Design

**Before marking any UI task complete, test on:**
1. **Mobile**: 375px width (iPhone SE)
2. **Tablet**: 768px width (iPad)
3. **Desktop**: 1440px width (standard laptop)

**Use browser DevTools device emulation to test all breakpoints.**

### 9. Common Responsive Patterns

**Sidebar Navigation:**
```tsx
// Drawer on mobile, persistent sidebar on desktop
<Box sx={{ display: 'flex' }}>
  <Drawer
    variant={{ xs: 'temporary', md: 'permanent' }}
    open={mobileOpen}
  >
    <Navigation />
  </Drawer>
  <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
    <Content />
  </Box>
</Box>
```

**Form Layouts:**
```tsx
// Single column on mobile, two columns on desktop
<Grid container spacing={2}>
  <Grid item xs={12} md={6}>
    <TextField label="First Name" fullWidth />
  </Grid>
  <Grid item xs={12} md={6}>
    <TextField label="Last Name" fullWidth />
  </Grid>
</Grid>
```

### 10. useMediaQuery Hook

For component logic based on screen size:
```tsx
import { useMediaQuery, useTheme } from '@mui/material';

function ResponsiveComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return isMobile ? <MobileView /> : <DesktopView />;
}
```

### 11. Responsive Images

```tsx
<Box
  component="img"
  src="/image.jpg"
  sx={{
    width: '100%',
    height: 'auto',
    maxWidth: { xs: '100%', md: '600px' },
  }}
/>
```

### 12. Performance Considerations

- **Avoid loading desktop assets on mobile** - use conditional rendering
- **Use lazy loading** for images and heavy components
- **Test on real devices** when possible, not just browser emulation

### Checklist for Every UI Feature

- [ ] Tested on mobile (375px - 600px)
- [ ] Tested on tablet (600px - 900px)
- [ ] Tested on desktop (900px+)
- [ ] Touch targets are minimum 44x44px
- [ ] Text is readable without zooming
- [ ] No horizontal scrolling (unless intentional)
- [ ] Forms are easy to fill on mobile
- [ ] Navigation works on all screen sizes
- [ ] Images scale appropriately
- [ ] Performance is acceptable on mobile devices

## Key Takeaways

1. **React 19**: Use modern patterns (use, useTransition, Suspense), minimize useEffect
2. **Type Safety**: Never use `any` or `as unknown` - leverage oRPC's automatic typing
3. **Modular Structure**: Keep modules independent, no cross-module imports
4. **Code Splitting**: Lazy load pages and heavy components
5. **UI Components**: Create reusable components in `@connected-repo/ui-mui` package
6. **Direct Imports**: Import components directly from paths for better tree-shaking
7. **Backend Alignment**: Frontend module structure mirrors backend router organization
8. **Beautiful Design**: Prioritize tasteful, visually appealing interfaces with attention to detail
9. **Smooth UX**: All interactions should feel fluid with 200-300ms transitions
10. **Delightful Experience**: Add micro-interactions and feedback that make users smile
11. **Responsive Design**: ALWAYS ensure UI works perfectly on mobile, tablet, and desktop

## Additional Resources

- [React 19 Documentation](https://react.dev)
- [TanStack Query Documentation](https://tanstack.com/query)
- [oRPC Documentation](https://orpc.dev)
- [Vite Documentation](https://vite.dev)
- [Material-UI Documentation](https://mui.com)
