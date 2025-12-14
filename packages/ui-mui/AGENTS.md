# @connected-repo/ui-mui

Material-UI component library with direct exports for optimal tree-shaking and bundle size optimization.

## Purpose

This package provides:
- Re-exports of Material-UI components for consistent theming
- Custom composite components built on MUI primitives
- Shared theme configuration
- Zero barrel exports for maximum bundle efficiency
- React Hook Form wrapper components for seamless form integration

## Package Structure

```
ui-mui/
├── src/
│   ├── components/      # Custom composite components
│   ├── data-display/    # MUI data display re-exports
│   ├── feedback/        # MUI feedback re-exports
│   ├── form/            # MUI form re-exports
│   ├── layout/          # MUI layout re-exports
│   ├── rhf-form/        # React Hook Form wrapper components
│   └── theme/           # Theme configuration
├── dist/               # Compiled JavaScript (generated)
├── package.json
└── tsconfig.json
```

## Import Patterns

### External Imports (From Other Apps/Packages)
When importing from this package in other apps or packages, use direct category/component imports:

```typescript
// ✅ Correct - External imports from other apps/packages
import { Button } from '@connected-repo/ui-mui/form/Button'
import { TextField } from '@connected-repo/ui-mui/form/TextField'
import { RhfFormProvider } from '@connected-repo/ui-mui/rhf-form/FormProvider'
import { Alert } from '@connected-repo/ui-mui/feedback/Alert'

// ❌ Wrong - Package root imports are blocked
import { Button, TextField } from '@connected-repo/ui-mui'
```

### Internal Imports (Within ui-mui Package)
When importing files within this package, **always use relative imports**:

```typescript
// ✅ Correct - Internal imports within ui-mui package
// File: src/rhf-form/FormProvider.tsx
import { NumLockAlert } from "../feedback/NumLockAlert";
import { FormErrorDisplayer } from "./FormErrorDisplayer";

// File: src/theme/ThemeProvider.tsx
import { theme } from "./theme.config";

// ❌ Wrong - Don't use package alias for internal imports
import { NumLockAlert } from "@ui-mui/feedback/NumLockAlert";
import { theme } from "@ui-mui/theme/theme.config";
```

**Why relative imports internally?**
- Prevents circular dependency issues
- Faster TypeScript compilation
- Clearer module resolution
- Standard practice for package development

## Component Categories

### form/ - Form Controls and Inputs

Direct re-exports from @mui/material with TypeScript types:

```typescript
import { Button, type ButtonProps } from '@connected-repo/ui-mui/form/Button'
import { TextField, type TextFieldProps } from '@connected-repo/ui-mui/form/TextField'
import { Select, type SelectProps } from '@connected-repo/ui-mui/form/Select'
import { Checkbox, type CheckboxProps } from '@connected-repo/ui-mui/form/Checkbox'
import { Radio, type RadioProps } from '@connected-repo/ui-mui/form/Radio'
import { Switch, type SwitchProps } from '@connected-repo/ui-mui/form/Switch'
import { FormControl, type FormControlProps } from '@connected-repo/ui-mui/form/FormControl'
import { MenuItem, type MenuItemProps } from '@connected-repo/ui-mui/form/MenuItem'
import { ToggleButton, type ToggleButtonProps } from '@connected-repo/ui-mui/form/ToggleButton'
import { ToggleButtonGroup, type ToggleButtonGroupProps } from '@connected-repo/ui-mui/form/ToggleButtonGroup'
```

**Usage Example**:
```typescript
import { Button } from '@connected-repo/ui-mui/form/Button'
import { TextField } from '@connected-repo/ui-mui/form/TextField'

function LoginForm() {
  return (
    <form>
      <TextField label="Email" type="email" fullWidth />
      <TextField label="Password" type="password" fullWidth />
      <Button variant="contained" color="primary" type="submit">
        Login
      </Button>
    </form>
  )
}
```

### layout/ - Layout and Structure

```typescript
import { Box, type BoxProps } from '@connected-repo/ui-mui/layout/Box'
import { Stack, type StackProps } from '@connected-repo/ui-mui/layout/Stack'
import { Grid, type GridProps } from '@connected-repo/ui-mui/layout/Grid'
import { Container, type ContainerProps } from '@connected-repo/ui-mui/layout/Container'
import { Paper, type PaperProps } from '@connected-repo/ui-mui/layout/Paper'
import { Card, type CardProps } from '@connected-repo/ui-mui/layout/Card'
import { Divider, type DividerProps } from '@connected-repo/ui-mui/layout/Divider'
```

**Usage Example**:
```typescript
import { Container } from '@connected-repo/ui-mui/layout/Container'
import { Stack } from '@connected-repo/ui-mui/layout/Stack'
import { Paper } from '@connected-repo/ui-mui/layout/Paper'

function Dashboard() {
  return (
    <Container maxWidth="lg">
      <Stack spacing={3}>
        <Paper elevation={2} sx={{ p: 3 }}>
          Content here
        </Paper>
      </Stack>
    </Container>
  )
}
```

### feedback/ - User Feedback Components

```typescript
import { Alert, type AlertProps } from '@connected-repo/ui-mui/feedback/Alert'
import { AlertTitle, type AlertTitleProps } from '@connected-repo/ui-mui/feedback/AlertTitle'
import { CircularProgress, type CircularProgressProps } from '@connected-repo/ui-mui/feedback/CircularProgress'
import { LinearProgress, type LinearProgressProps } from '@connected-repo/ui-mui/feedback/LinearProgress'
import { Dialog, type DialogProps } from '@connected-repo/ui-mui/feedback/Dialog'
import { Snackbar, type SnackbarProps } from '@connected-repo/ui-mui/feedback/Snackbar'
import { Backdrop, type BackdropProps } from '@connected-repo/ui-mui/feedback/Backdrop'
import { Skeleton, type SkeletonProps } from '@connected-repo/ui-mui/feedback/Skeleton'
```

**Usage Example**:
```typescript
import { Alert } from '@connected-repo/ui-mui/feedback/Alert'
import { CircularProgress } from '@connected-repo/ui-mui/feedback/CircularProgress'

function StatusDisplay({ loading, error }: { loading: boolean; error?: string }) {
  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>
  return null
}
```

### data-display/ - Data Presentation

```typescript
import { Typography, type TypographyProps } from '@connected-repo/ui-mui/data-display/Typography'
import { Table, type TableProps } from '@connected-repo/ui-mui/data-display/Table'
import { List, type ListProps } from '@connected-repo/ui-mui/data-display/List'
import { Chip, type ChipProps } from '@connected-repo/ui-mui/data-display/Chip'
import { Avatar, type AvatarProps } from '@connected-repo/ui-mui/data-display/Avatar'
import { Badge, type BadgeProps } from '@connected-repo/ui-mui/data-display/Badge'
import { Tooltip, type TooltipProps } from '@connected-repo/ui-mui/data-display/Tooltip'
```

**Usage Example**:
```typescript
import { Typography } from '@connected-repo/ui-mui/data-display/Typography'
import { Chip } from '@connected-repo/ui-mui/data-display/Chip'

function ProductCard({ title, tags }: { title: string; tags: string[] }) {
  return (
    <div>
      <Typography variant="h5">{title}</Typography>
      {tags.map(tag => (
        <Chip key={tag} label={tag} size="small" />
      ))}
    </div>
  )
}
```

### components/ - Custom Composite Components

These are custom components built on top of MUI primitives:

```typescript
import { ContentCard, type ContentCardProps } from '@connected-repo/ui-mui/components/ContentCard'
import { ErrorAlert, type ErrorAlertProps } from '@connected-repo/ui-mui/components/ErrorAlert'
import { SuccessAlert, type SuccessAlertProps } from '@connected-repo/ui-mui/components/SuccessAlert'
import { LoadingSpinner, type LoadingSpinnerProps } from '@connected-repo/ui-mui/components/LoadingSpinner'
import { PrimaryButton, type PrimaryButtonProps } from '@connected-repo/ui-mui/components/PrimaryButton'
import { SecondaryButton, type SecondaryButtonProps } from '@connected-repo/ui-mui/components/SecondaryButton'
```

**ContentCard** - Pre-styled card with padding and borders:
```typescript
import { ContentCard } from '@connected-repo/ui-mui/components/ContentCard'

function MyCard() {
  return (
    <ContentCard>
      <h3>Title</h3>
      <p>Content goes here</p>
    </ContentCard>
  )
}
// Renders with p: 2.5, mb: 2.5, border: 1px solid divider
```

**ErrorAlert / SuccessAlert** - Pre-configured alert components:
```typescript
import { ErrorAlert } from '@connected-repo/ui-mui/components/ErrorAlert'
import { SuccessAlert } from '@connected-repo/ui-mui/components/SuccessAlert'

function StatusMessages() {
  return (
    <>
      <ErrorAlert>An error occurred!</ErrorAlert>
      <SuccessAlert>Operation successful!</SuccessAlert>
    </>
  )
}
```

**LoadingSpinner** - Centered loading indicator:
```typescript
import { LoadingSpinner } from '@connected-repo/ui-mui/components/LoadingSpinner'

function AsyncContent() {
  return <LoadingSpinner />
}
```

**PrimaryButton / SecondaryButton** - Styled button variants:
```typescript
import { PrimaryButton } from '@connected-repo/ui-mui/components/PrimaryButton'
import { SecondaryButton } from '@connected-repo/ui-mui/components/SecondaryButton'

function Actions() {
  return (
    <>
      <PrimaryButton onClick={handleSubmit}>Submit</PrimaryButton>
      <SecondaryButton onClick={handleCancel}>Cancel</SecondaryButton>
    </>
  )
}
```

### rhf-form/ - React Hook Form Components

React Hook Form wrapper components for Material-UI form elements with consistent styling and error handling:

```typescript
import { RhfFormProvider } from '@connected-repo/ui-mui/rhf-form/RhfFormProvider'
import { useRhfForm } from '@connected-repo/ui-mui/rhf-form/useRhfForm'
import { RhfTextField } from '@connected-repo/ui-mui/rhf-form/RhfTextField'
import { RhfCheckbox } from '@connected-repo/ui-mui/rhf-form/RhfCheckbox'
import { RhfSwitch } from '@connected-repo/ui-mui/rhf-form/RhfSwitch'
import { RhfSelect } from '@connected-repo/ui-mui/rhf-form/RhfSelect'
import { RhfRadio } from '@connected-repo/ui-mui/rhf-form/RhfRadio'
import { RhfSubmitButton } from '@connected-repo/ui-mui/rhf-form/RhfSubmitButton'
import { FormErrorDisplayer } from '@connected-repo/ui-mui/rhf-form/FormErrorDisplayer'
```

**Base Styling Applied to All RHF Components:**
- Responsive bottom margin (16px mobile, 20px desktop for fields; 12px mobile, 16px desktop for checkboxes/switches)
- Full width by default
- Font size adjusted to prevent iOS zoom (16px mobile, 14px desktop)
- Error state handling with helper text
- Consistent spacing and alignment

**RhfTextField** - React Hook Form wrapper for TextField:
```typescript
import { RhfTextField } from '@connected-repo/ui-mui/rhf-form/RhfTextField'
import { useRhfForm } from '@connected-repo/ui-mui/rhf-form/useRhfForm'

function MyForm() {
  const { formMethods, RhfFormProvider } = useRhfForm({
    onSubmit: async (data) => {
      console.log(data)
    }
  })

  return (
    <RhfFormProvider>
      <RhfTextField
        name="email"
        label="Email"
        type="email"
        // Custom styling override
        sx={{ mb: 3 }}
      />
      <RhfTextField
        name="password"
        label="Password"
        type="password"
      />
    </RhfFormProvider>
  )
}
```

**RhfCheckbox** - React Hook Form wrapper for Checkbox:
```typescript
import { RhfCheckbox } from '@connected-repo/ui-mui/rhf-form/RhfCheckbox'

<RhfCheckbox
  name="terms"
  label="I agree to the terms and conditions"
  checkboxProps={{ color: 'primary' }}
  sx={{ mb: 3 }} // Custom styling override
/>
```

**RhfSwitch** - React Hook Form wrapper for Switch:
```typescript
import { RhfSwitch } from '@connected-repo/ui-mui/rhf-form/RhfSwitch'

<RhfSwitch
  name="notifications"
  label="Enable notifications"
  switchProps={{ color: 'success' }}
/>
```

**RhfSelect** - React Hook Form wrapper for Select with options:
```typescript
import { RhfSelect } from '@connected-repo/ui-mui/rhf-form/RhfSelect'

<RhfSelect
  name="country"
  label="Country"
  placeholder="Select a country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada', disabled: true },
  ]}
  sx={{ mb: 3 }} // Custom styling override
/>
```

**RhfRadio** - React Hook Form wrapper for Radio Group:
```typescript
import { RhfRadio } from '@connected-repo/ui-mui/rhf-form/RhfRadio'

<RhfRadio
  name="gender"
  label="Gender"
  options={[
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ]}
  row // Display options horizontally
/>
```

**Complete Form Example:**
```typescript
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRhfForm } from '@connected-repo/ui-mui/rhf-form/useRhfForm'
import { RhfTextField } from '@connected-repo/ui-mui/rhf-form/RhfTextField'
import { RhfCheckbox } from '@connected-repo/ui-mui/rhf-form/RhfCheckbox'
import { RhfSelect } from '@connected-repo/ui-mui/rhf-form/RhfSelect'
import { RhfSubmitButton } from '@connected-repo/ui-mui/rhf-form/RhfSubmitButton'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  country: z.string().min(1, 'Please select a country'),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms'),
})

function RegistrationForm() {
  const { formMethods, RhfFormProvider } = useRhfForm({
    onSubmit: async (data) => {
      // Submit form data
      await api.register(data)
    },
    formConfig: {
      resolver: zodResolver(schema),
    }
  })

  return (
    <RhfFormProvider>
      <RhfTextField name="email" label="Email" type="email" />

      <RhfSelect
        name="country"
        label="Country"
        options={[
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
        ]}
      />

      <RhfCheckbox name="terms" label="I agree to the terms" />

      <RhfSubmitButton
        notSubmittingText="Register"
        isSubmittingText="Registering..."
      />
    </RhfFormProvider>
  )
}
```

**Customization:**
All RHF components accept an `sx` prop to override or extend base styles:
```typescript
<RhfTextField
  name="email"
  label="Email"
  // Override base margin, add custom styling
  sx={{
    mb: 4,
    '& .MuiInputBase-root': {
      borderRadius: 3
    }
  }}
/>
```

### theme/ - Theme Configuration

```typescript
import { theme } from '@connected-repo/ui-mui/theme/theme'
import { ThemeProvider } from '@connected-repo/ui-mui/theme/ThemeProvider'
```

**Theme Configuration**:
- Primary: `#007bff` (Blue)
- Secondary: `#6c757d` (Gray)
- Success: `#28a745` (Green)
- Error: `#dc3545` (Red)
- Warning: `#ffc107` (Amber)
- Info: `#17a2b8` (Cyan)
- Font: System font stack (Apple, Roboto, etc.)
- Border radius: 5px
- Spacing: 8px base unit

**Component Defaults**:
- Buttons: No elevation, no text transform, font-weight 500
- TextFields: Outlined variant, small size
- Cards: Subtle shadow (1px + 2px)
- Alerts: 5px border radius

**ThemeProvider Usage**:
```typescript
import { ThemeProvider } from '@connected-repo/ui-mui/theme/ThemeProvider'

function App() {
  return (
    <ThemeProvider>
      {/* Your app components */}
    </ThemeProvider>
  )
}
```

**Custom Theme Extension**:
```typescript
import { theme as baseTheme } from '@connected-repo/ui-mui/theme/theme'
import { createTheme, ThemeProvider } from '@mui/material/styles'

const customTheme = createTheme({
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    primary: {
      main: '#ff5722', // Override primary color
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={customTheme}>
      {/* Your app */}
    </ThemeProvider>
  )
}
```

## Adding New Components

### Adding MUI Re-export

1. **Create component file** in appropriate category:
   ```typescript
   // src/form/DatePicker.tsx
   export { default as DatePicker, type DatePickerProps } from "@mui/x-date-pickers/DatePicker"
   ```

2. **Update package.json exports** if new category:
   ```json
   {
     "exports": {
       "./form/*": {
         "types": "./src/form/*.tsx",
         "import": "./dist/form/*.js"
       }
     }
   }
   ```

3. **Rebuild**: `yarn build`

### Adding Custom Component

1. **Create component file**:
   ```typescript
   // src/components/MyComponent.tsx
   import type { BoxProps } from "@mui/material/Box"
   import Box from "@mui/material/Box"

   export interface MyComponentProps extends BoxProps {
     title: string
   }

   export const MyComponent = ({ title, children, ...props }: MyComponentProps) => {
     return (
       <Box {...props}>
         <h3>{title}</h3>
         {children}
       </Box>
     )
   }
   ```

2. **Export with types**:
   ```typescript
   export { MyComponent, type MyComponentProps }
   ```

3. **Rebuild**: `yarn build`

4. **Use in app**:
   ```typescript
   import { MyComponent } from '@connected-repo/ui-mui/components/MyComponent'
   ```

### Adding New Category

1. **Create directory**: `src/navigation/`
2. **Add components** to directory
3. **Update package.json**:
   ```json
   {
     "exports": {
       "./navigation/*": {
         "types": "./src/navigation/*.tsx",
         "import": "./dist/navigation/*.js",
         "default": "./dist/navigation/*.js"
       }
     }
   }
   ```
4. **Rebuild**: `yarn build`

## TypeScript Integration

All components export both the component and its props type:

```typescript
import { Button, type ButtonProps } from '@connected-repo/ui-mui/form/Button'

// Extend props
interface MyButtonProps extends ButtonProps {
  loading?: boolean
}

function MyButton({ loading, children, ...props }: MyButtonProps) {
  return (
    <Button disabled={loading} {...props}>
      {loading ? 'Loading...' : children}
    </Button>
  )
}
```

## Styling Components

### Using sx Prop

```typescript
import { Box } from '@connected-repo/ui-mui/layout/Box'

function StyledBox() {
  return (
    <Box
      sx={{
        p: 2,                    // Padding: 2 * 8px = 16px
        bgcolor: 'primary.main',  // Theme color
        borderRadius: 1,          // 1 * 5px = 5px
        '&:hover': {
          bgcolor: 'primary.dark',
        },
      }}
    >
      Content
    </Box>
  )
}
```

### Theme Spacing

```typescript
// Available spacing multipliers
sx={{ p: 1 }}  // 8px
sx={{ p: 2 }}  // 16px
sx={{ p: 3 }}  // 24px
sx={{ m: 2.5 }} // 20px
```

### Theme Colors

```typescript
sx={{
  color: 'primary.main',     // #007bff
  bgcolor: 'error.light',    // Light red
  borderColor: 'divider',    // Border color
}}
```

## Peer Dependencies

Required in consuming applications:

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@mui/material": "^7.3.4",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1"
  }
}
```

## Design Excellence for UI Components

**CRITICAL: All components must prioritize beautiful, tasteful design with smooth interactions and delightful user experience.**

### Component Design Principles

#### 1. Beautiful by Default

Every component should be visually appealing out of the box:

```typescript
// ✓ GOOD - Thoughtful design details
import { Card } from "@mui/material/Card"
import { CardContent } from "@mui/material/CardContent"

export const ContentCard = ({ children, ...props }) => {
  return (
    <Card
      {...props}
      sx={{
        p: 2.5,
        mb: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)',
        },
        ...props.sx,
      }}
    >
      {children}
    </Card>
  )
}

// ✗ BAD - No attention to visual quality
export const UglyCard = ({ children }) => (
  <div style={{ border: '1px solid black' }}>
    {children}
  </div>
)
```

#### 2. Smooth Interactions

**All interactive components must have smooth transitions:**

```typescript
export const AnimatedButton = ({ children, ...props }) => (
  <Button
    {...props}
    sx={{
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 4,
      },
      '&:active': {
        transform: 'translateY(0)',
        boxShadow: 2,
      },
      ...props.sx,
    }}
  >
    {children}
  </Button>
)
```

**Animation duration standards:**
- Micro-interactions: 150-200ms (button hovers, ripples)
- Content transitions: 250-300ms (cards, modals appearing)
- Page transitions: 300-400ms (route changes)
- Always use `ease-in-out` or `cubic-bezier` for natural feel

#### 3. Delightful Feedback

**Components should provide immediate, pleasant feedback:**

```typescript
export const InteractiveCard = ({ onClick, children, ...props }) => {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <Card
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.15s ease-in-out',
        transform: isPressed ? 'scale(0.98)' : 'scale(1)',
        '&:hover': {
          boxShadow: 6,
          borderColor: 'primary.light',
        },
        '&:active': {
          boxShadow: 2,
        },
        ...props.sx,
      }}
    >
      {children}
    </Card>
  )
}
```

#### 4. Sophisticated Color Usage

**Use colors purposefully and tastefully:**

```typescript
// Color palette for components
export const themeColors = {
  // Subtle backgrounds
  backgroundSubtle: 'background.default',
  backgroundElevated: 'background.paper',

  // Text hierarchy
  textPrimary: 'text.primary',      // Main content
  textSecondary: 'text.secondary',  // Supporting text
  textDisabled: 'text.disabled',    // Inactive elements

  // Semantic colors
  success: 'success.main',
  error: 'error.main',
  warning: 'warning.main',
  info: 'info.main',

  // Borders and dividers
  border: 'divider',
  borderLight: 'grey.200',
  borderDark: 'grey.400',
}

// Use in components
export const StatusBadge = ({ status, children }) => {
  const colors = {
    success: { bg: 'success.light', text: 'success.dark' },
    error: { bg: 'error.light', text: 'error.dark' },
    warning: { bg: 'warning.light', text: 'warning.dark' },
  }

  return (
    <Chip
      label={children}
      sx={{
        bgcolor: colors[status].bg,
        color: colors[status].text,
        fontWeight: 500,
        border: 'none',
      }}
    />
  )
}
```

#### 5. Thoughtful Spacing

**Generous, harmonious spacing in all components:**

```typescript
export const WellSpacedCard = ({ title, description, actions }) => (
  <Card sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom mb={1.5}>
      {title}
    </Typography>

    <Typography variant="body2" color="text.secondary" mb={3} lineHeight={1.7}>
      {description}
    </Typography>

    <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
      {actions}
    </Box>
  </Card>
)
```

**Spacing standards for components:**
- Tight spacing: `0.5-1` (4-8px) - Related inline elements
- Default spacing: `2` (16px) - Form fields, list items
- Generous spacing: `3-4` (24-32px) - Sections, card content
- Extra spacing: `5-6` (40-48px) - Page sections, major separations

#### 6. Elegant Typography

**Typography should enhance readability and visual hierarchy:**

```typescript
export const TypographicCard = ({ title, subtitle, content }) => (
  <Card sx={{ p: 3 }}>
    <Typography
      variant="h4"
      fontWeight={600}
      color="text.primary"
      mb={1}
      letterSpacing={-0.5}
    >
      {title}
    </Typography>

    <Typography
      variant="subtitle1"
      color="primary.main"
      fontWeight={500}
      mb={2}
    >
      {subtitle}
    </Typography>

    <Typography
      variant="body1"
      color="text.secondary"
      lineHeight={1.7}
    >
      {content}
    </Typography>
  </Card>
)
```

**Typography standards:**
- Headings: fontWeight 600-700, tight letter-spacing (-0.5 to -1)
- Body text: lineHeight 1.6-1.8 for readability
- Labels: fontWeight 500-600, slightly smaller size
- Captions: color text.secondary, 70-80% opacity

### Component State Design

#### 1. Loading States

**Loading states should be elegant and non-intrusive:**

```typescript
export const LoadingCard = ({ isLoading, children }) => {
  if (isLoading) {
    return (
      <Card sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Skeleton variant="text" width="60%" height={32} animation="wave" />
          <Skeleton variant="rectangular" height={120} animation="wave" />
          <Skeleton variant="text" width="80%" animation="wave" />
        </Stack>
      </Card>
    )
  }

  return <Card sx={{ p: 3 }}>{children}</Card>
}
```

#### 2. Hover and Focus States

**All interactive components need clear hover/focus states:**

```typescript
export const InteractiveListItem = ({ children, ...props }) => (
  <ListItem
    {...props}
    sx={{
      borderRadius: 1,
      transition: 'all 0.15s ease-in-out',
      cursor: 'pointer',

      // Hover state
      '&:hover': {
        bgcolor: 'action.hover',
        transform: 'translateX(4px)',
      },

      // Focus state (keyboard navigation)
      '&:focus-visible': {
        outline: '2px solid',
        outlineColor: 'primary.main',
        outlineOffset: 2,
        bgcolor: 'action.selected',
      },

      // Active/pressed state
      '&:active': {
        transform: 'translateX(2px)',
        bgcolor: 'action.selected',
      },

      ...props.sx,
    }}
  >
    {children}
  </ListItem>
)
```

#### 3. Error and Empty States

**Make error and empty states helpful and visually pleasing:**

```typescript
export const EmptyState = ({
  icon,
  title,
  description,
  action
}) => (
  <Box
    sx={{
      textAlign: 'center',
      py: 8,
      px: 3,
    }}
  >
    <Box sx={{
      fontSize: 64,
      color: 'text.disabled',
      mb: 2,
      opacity: 0.5,
    }}>
      {icon}
    </Box>

    <Typography variant="h6" color="text.primary" gutterBottom>
      {title}
    </Typography>

    <Typography variant="body2" color="text.secondary" mb={3} maxWidth={400} mx="auto">
      {description}
    </Typography>

    {action && (
      <Box>{action}</Box>
    )}
  </Box>
)

export const ErrorState = ({
  message,
  onRetry
}) => (
  <Alert
    severity="error"
    sx={{
      borderRadius: 2,
      alignItems: 'center',
    }}
    action={
      onRetry && (
        <Button
          color="inherit"
          size="small"
          onClick={onRetry}
          sx={{ fontWeight: 600 }}
        >
          Try Again
        </Button>
      )
    }
  >
    <AlertTitle>Something went wrong</AlertTitle>
    {message}
  </Alert>
)
```

### Polish and Details

#### 1. Micro-interactions

**Small interactions that delight users:**

```typescript
export const LikeButton = () => {
  const [liked, setLiked] = useState(false)

  return (
    <IconButton
      onClick={() => setLiked(!liked)}
      sx={{
        transition: 'all 0.2s ease-in-out',
        color: liked ? 'error.main' : 'text.secondary',
        transform: liked ? 'scale(1.1)' : 'scale(1)',
        '&:hover': {
          transform: 'scale(1.15)',
          bgcolor: liked ? 'error.lighter' : 'action.hover',
        },
        '&:active': {
          transform: 'scale(0.95)',
        },
      }}
    >
      <FavoriteIcon />
    </IconButton>
  )
}
```

#### 2. Elevation and Depth

**Use subtle shadows for depth:**

```typescript
// Elevation levels for components
export const elevationStyles = {
  flat: {
    boxShadow: 'none',
    border: '1px solid',
    borderColor: 'divider',
  },

  subtle: {
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },

  elevated: {
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },

  floating: {
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
}

export const FloatingCard = ({ children }) => (
  <Card
    sx={{
      ...elevationStyles.subtle,
      transition: 'all 0.3s ease-in-out',
      '&:hover': elevationStyles.elevated,
    }}
  >
    {children}
  </Card>
)
```

#### 3. Consistent Borders and Radii

**Maintain consistent border styling:**

```typescript
export const borderStyles = {
  radius: {
    small: 1,    // 8px
    medium: 2,   // 16px
    large: 3,    // 24px
  },

  width: {
    thin: '1px',
    medium: '2px',
    thick: '3px',
  },
}

export const BorderedCard = ({ children, ...props }) => (
  <Card
    {...props}
    sx={{
      border: borderStyles.width.thin,
      borderColor: 'divider',
      borderRadius: borderStyles.radius.medium,
      ...props.sx,
    }}
  >
    {children}
  </Card>
)
```

### Component Quality Checklist

Before adding any component to this package:

**Visual Design:**
- [ ] Component is visually appealing and tastefully designed
- [ ] Colors are purposeful and create good contrast
- [ ] Typography hierarchy is clear and readable
- [ ] Spacing is generous and consistent
- [ ] Borders and shadows are subtle and professional

**Interactions:**
- [ ] All transitions are smooth (200-300ms)
- [ ] Hover states are clear and immediate
- [ ] Focus states are visible for keyboard navigation
- [ ] Active/pressed states provide tactile feedback
- [ ] Loading states are elegant (skeleton > spinner)

**User Experience:**
- [ ] Component behavior is intuitive
- [ ] Error states are friendly and actionable
- [ ] Empty states are helpful and inviting
- [ ] Success states are celebratory
- [ ] Micro-interactions add delight

**Polish:**
- [ ] All edges and corners are considered
- [ ] Animation timing feels natural
- [ ] Component works in light/dark modes
- [ ] Accessibility is maintained (contrast, focus)
- [ ] Performance is optimal (60fps animations)

## Responsive Design for UI Components

**CRITICAL: All components in this package MUST be designed to be highly responsive across desktop, tablet, and mobile devices.**

### 1. Responsive Component Design Principles

When creating custom components in `src/components/`, ensure they adapt to all screen sizes:

```typescript
// Example: Responsive Card Component
import type { CardProps } from "@mui/material/Card"
import Card from "@mui/material/Card"
import Box from "@mui/material/Box"

export interface ResponsiveCardProps extends CardProps {
  title: string
}

export const ResponsiveCard = ({ title, children, ...props }: ResponsiveCardProps) => {
  return (
    <Card
      {...props}
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },        // Responsive padding
        mb: { xs: 2, md: 2.5 },               // Responsive margin
        width: { xs: '100%', md: 'auto' },    // Full width on mobile
        ...props.sx,                          // Allow sx override
      }}
    >
      <Box
        sx={{
          fontSize: { xs: '1.25rem', md: '1.5rem' }, // Responsive text
        }}
      >
        {title}
      </Box>
      {children}
    </Card>
  )
}
```

### 2. MUI Breakpoints Reference

All components should use MUI's standard breakpoints:

```typescript
// Breakpoint values
xs: 0px      // Mobile phones
sm: 600px    // Large phones, small tablets
md: 900px    // Tablets
lg: 1200px   // Laptops, desktops
xl: 1536px   // Large desktops
```

### 3. Responsive sx Prop Patterns

**Object notation for multiple breakpoints:**
```typescript
sx={{
  padding: { xs: 1, sm: 2, md: 3, lg: 4 },
  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
  display: { xs: 'block', md: 'flex' },
  flexDirection: { xs: 'column', md: 'row' },
}}
```

**Shorthand for up/down:**
```typescript
sx={{
  // Apply to md and up (desktop)
  md: { display: 'flex' },

  // Hide on mobile, show on tablet+
  display: { xs: 'none', sm: 'block' },
}}
```

### 4. Responsive Layout Components

When creating layout components, prioritize mobile:

```typescript
// Example: Responsive Grid Container Component
import Grid from "@mui/material/Grid"

export const ResponsiveGrid = ({ children }) => {
  return (
    <Grid
      container
      spacing={{ xs: 2, sm: 2.5, md: 3 }}  // Responsive spacing
      columns={{ xs: 4, sm: 8, md: 12 }}   // Responsive column count
    >
      {children}
    </Grid>
  )
}
```

### 5. Touch-Friendly Component Sizing

Components must meet minimum touch target sizes:

```typescript
// Buttons with responsive, touch-friendly sizing
export const TouchFriendlyButton = ({ children, ...props }) => {
  return (
    <Button
      {...props}
      sx={{
        minHeight: 44,                        // Minimum 44px for touch
        minWidth: 44,
        padding: { xs: '12px 24px', md: '8px 16px' },
        fontSize: { xs: '1rem', md: '0.875rem' },
        ...props.sx,
      }}
    >
      {children}
    </Button>
  )
}
```

### 6. Responsive Typography Components

```typescript
export const ResponsiveHeading = ({ children, ...props }) => {
  return (
    <Typography
      variant="h2"
      {...props}
      sx={{
        fontSize: {
          xs: '1.5rem',    // 24px on mobile
          sm: '2rem',      // 32px on tablet
          md: '2.5rem',    // 40px on desktop
        },
        lineHeight: {
          xs: 1.3,
          md: 1.4,
        },
        mb: { xs: 2, md: 3 },
        ...props.sx,
      }}
    >
      {children}
    </Typography>
  )
}
```

### 7. Responsive Form Components

Forms need special attention for mobile usability:

```typescript
export const ResponsiveTextField = ({ ...props }) => {
  return (
    <TextField
      {...props}
      fullWidth                              // Always full width
      sx={{
        mb: { xs: 2, md: 2.5 },
        '& .MuiInputBase-input': {
          fontSize: { xs: '16px', md: '14px' }, // Prevent iOS zoom on focus
          padding: { xs: '16px', md: '12px' },  // Larger touch area
        },
        ...props.sx,
      }}
    />
  )
}
```

### 8. Responsive Spacing System

Use responsive spacing throughout components:

```typescript
// Spacing multipliers (theme.spacing = 8px)
sx={{
  p: { xs: 1, sm: 2, md: 3 },    // 8px -> 16px -> 24px
  m: { xs: 1.5, sm: 2, md: 2.5 }, // 12px -> 16px -> 20px
  gap: { xs: 1, md: 2 },          // 8px -> 16px
}}
```

### 9. Testing Custom Components

**Before adding any component to this package:**

1. **Test at key breakpoints:**
   - 375px (iPhone SE - small mobile)
   - 768px (iPad - tablet)
   - 1440px (Standard laptop)

2. **Verify touch targets:**
   - Minimum 44x44px for interactive elements
   - Adequate spacing between clickable items

3. **Check text readability:**
   - Font sizes legible without zoom
   - Sufficient line height and contrast

4. **Validate layouts:**
   - No horizontal overflow on mobile
   - Content stacks appropriately
   - Whitespace scales with screen size

### 10. Component Documentation Template

When adding components, document responsive behavior:

```typescript
/**
 * ResponsiveCard - A card component that adapts to all screen sizes
 *
 * Responsive behavior:
 * - Mobile (xs): Full width, 16px padding, stacked content
 * - Tablet (sm-md): Flexible width, 20px padding
 * - Desktop (lg+): Fixed max-width, 24px padding, horizontal layout
 *
 * @example
 * <ResponsiveCard title="Example">
 *   Content automatically adapts to screen size
 * </ResponsiveCard>
 */
export const ResponsiveCard = ({ ... }) => { ... }
```

### 11. Common Responsive Patterns for Components

**Conditional Rendering:**
```typescript
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

export const AdaptiveComponent = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Box>
      {isMobile ? <MobileVariant /> : <DesktopVariant />}
    </Box>
  )
}
```

**Responsive Containers:**
```typescript
export const ResponsiveContainer = ({ children }) => {
  return (
    <Container
      maxWidth="lg"
      sx={{
        px: { xs: 2, sm: 3, md: 4 },  // Responsive horizontal padding
        py: { xs: 2, md: 4 },          // Responsive vertical padding
      }}
    >
      {children}
    </Container>
  )
}
```

**Responsive Flex Layouts:**
```typescript
export const FlexLayout = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },  // Stack on mobile
        gap: { xs: 2, md: 3 },
        alignItems: { xs: 'stretch', md: 'center' },
      }}
    >
      {children}
    </Box>
  )
}
```

### 12. Responsive Component Checklist

Before merging any component to this package:

- [ ] Component renders correctly at 375px (mobile)
- [ ] Component renders correctly at 768px (tablet)
- [ ] Component renders correctly at 1440px+ (desktop)
- [ ] All interactive elements are minimum 44x44px on mobile
- [ ] Text is readable without zooming on all devices
- [ ] Spacing scales appropriately across breakpoints
- [ ] No content overflow or horizontal scrolling
- [ ] Touch interactions work smoothly on mobile
- [ ] Component documentation includes responsive behavior notes
- [ ] Props support sx override for custom responsive adjustments

## Best Practices

### Code Quality
1. ✅ **Import directly** from category/component paths
2. ✅ **Export types** alongside components for custom components
3. ✅ **Use theme spacing** (multiples of 8) via `sx` prop
4. ✅ **Use theme colors** instead of hardcoded colors
5. ✅ **Extend MUI props** for custom components

### Design Excellence
6. ✅ **Prioritize beauty** - every component should be visually appealing
7. ✅ **Smooth transitions** - all interactions use 200-300ms animations
8. ✅ **Generous spacing** - don't be afraid of whitespace
9. ✅ **Purposeful colors** - use theme colors with intention
10. ✅ **Clear hierarchy** - typography and spacing create visual structure
11. ✅ **Delightful feedback** - add micro-interactions and hover effects
12. ✅ **Elegant loading** - use skeleton screens over spinners

### User Experience
13. ✅ **Immediate feedback** - acknowledge every user action
14. ✅ **Helpful errors** - make error states friendly and actionable
15. ✅ **Inviting empty states** - guide users with clear calls to action
16. ✅ **Keyboard accessible** - ensure focus states are visible

### Responsive Design
17. ✅ **Design components mobile-first** with responsive breakpoints
18. ✅ **Test all components** at xs, sm, md, lg breakpoints
19. ✅ **Ensure touch targets** are minimum 44x44px

### Anti-patterns
20. ❌ **Don't import from package root**
21. ❌ **Don't use inline styles** when `sx` prop available
22. ❌ **Don't override theme** without good reason
23. ❌ **Don't assume desktop-only usage** - always design responsively
24. ❌ **Don't skip transitions** - every interaction should feel smooth
25. ❌ **Don't use harsh colors** - maintain visual harmony
26. ❌ **Don't neglect empty/error states** - they're part of the experience

## Development

```bash
# Build package
yarn build

# Watch mode
yarn dev

# Type check
yarn typecheck

# Lint
yarn lint
```

## Troubleshooting

**Component not found**:
1. Check import path matches file location
2. Ensure package is built: `yarn build`
3. Verify exports in package.json

**Type errors**:
1. Check dist/ contains .d.ts files
2. Rebuild: `yarn build`
3. Restart TypeScript server

**Theme not applied**:
1. Ensure ThemeProvider wraps your app
2. Import theme from correct path
3. Check MUI peer dependencies installed

## Package Configuration

```json
{
  "name": "@connected-repo/ui-mui",
  "type": "module",
  "sideEffects": false,
  "peerDependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@mui/material": "^7.3.4",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1"
  },
  "exports": {
    "./components/*": {
      "types": "./src/components/*.tsx",
      "import": "./dist/components/*.js"
    },
    "./form/*": { /* ... */ },
    "./layout/*": { /* ... */ },
    "./feedback/*": { /* ... */ },
    "./data-display/*": { /* ... */ },
    "./theme/*": { /* ... */ }
  }
}
```

## Bundle Size Optimization

Direct imports ensure only used components are bundled:

```typescript
// ✅ Small bundle: ~5KB
import { Button } from '@connected-repo/ui-mui/form/Button'

// ❌ Large bundle: ~500KB (if barrel exports existed)
import { Button } from '@connected-repo/ui-mui'
```

Each import path is a potential code-split point, enabling:
- Tree-shaking unused components
- Lazy loading components dynamically
- Optimal chunk sizes
- Better browser caching

## Related Documentation

- [Material-UI Documentation](https://mui.com/material-ui/)
- [Emotion Documentation](https://emotion.sh/docs/introduction)
- [Parent CLAUDE.md](../CLAUDE.md)
