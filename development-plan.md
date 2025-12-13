# Development Plan - Scheduled Prompt & Journal App

**Project:** Connected Repo Starter - Journal MVP
**Repository:** teziapp/connected-repo-starter-oRPC
**Created:** 2025-10-27

---

## Project Overview

Building a **Scheduled Prompt & Journal** app that provides:
- Timed notifications with thought-provoking prompts
- Simple text-based journaling
- Search functionality for past entries
- Gamification (streaks & badges)
- Free tier (with ads) and paid tier (cloud sync, ad-free)
- Mobile & web support (PWA + Capacitor)

---

## Priority Levels

- **P0** = MVP Critical - Must have for launch (Weeks 1-3)
- **P1** = Post-MVP Important - Needed for growth (Weeks 4-6)
- **P2** = Future Enhancement - Polish & scale (Week 6+)

---

## Epic Overview

| Epic # | Name | Priority | Issues | Est. Hours |
|--------|------|----------|--------|------------|
| 1 | Authentication with Google OAuth | P0 | 5 | 16h |
| 2 | Core Journal Entry System | P0 | 6 | 21h |
| 3 | Prompt System | P0 | 5 | 17h |
| 4 | Scheduling & Email Notifications | P0 | 6 | 23h |
| 5 | Search & Dashboard | P0 | 4 | 19h |
| 6 | Testing Infrastructure | P0 | 5 | 22h |
| 7 | PWA Support | P0 | 5 | 17h |
| 8 | CI/CD & Deployment | P0 | 6 | 18h |
| 9 | Monitoring & Error Tracking | P0 | 5 | 17h |
| 10 | Gamification System | P1 | 7 | 28h |
| 11 | Payments & Subscriptions | P1 | 8 | 39h |
| 12 | Mobile App with Capacitor | P1 | 9 | 38h |
| 13 | Advanced Features & Polish | P1 | 8 | 39h |
| 14 | Advertising for Free Tier | P2 | 5 | 17h |

**Total: 14 Epics, 55 Issues, ~331 hours**

---

## Timeline

### **Phase 1: MVP Foundation (Weeks 1-2)**
- **Week 1:** Epics 1-3 (Auth, Journal Entries, Prompts)
- **Week 2:** Epics 4-5 (Scheduling, Search)

### **Phase 2: MVP Quality & Deploy (Week 3)**
- Epics 6-9 (Testing, PWA, CI/CD, Mobile App)
- **Target: MVP Launch**

### **Phase 3: Growth Features (Weeks 4-5)**
- Epics 10-12 (Monitoring, Gamification, Payments)

### **Phase 4: Mobile & Scale (Week 6+)**
- Epics 13-14 (Advanced Features, Ads)

---

## Detailed Epic Breakdown

---

## **EPIC 1: Authentication with Google OAuth [P0]** 🔐

**Goal:** Secure user authentication with Google sign-in using cookie-based sessions

**Why:** Users need a simple, secure way to create accounts and access their journal entries

**Technical Approach:**
- Google OAuth 2.0 with Passport.js or similar
- HTTP-only cookies for session management (no Redis needed for MVP)
- Store sessions in PostgreSQL or in-memory store
- Protected routes using tRPC middleware

### Issues:

#### Issue 1.1: Implement Google OAuth 2.0 with cookie-based sessions
- **Estimate:** 6h
- **Description:**
  - Set up Google OAuth credentials in Google Cloud Console
  - Install and configure authentication library (Passport.js or Arctic)
  - Implement OAuth callback handler
  - Create session management with HTTP-only cookies
  - Store sessions in PostgreSQL user_sessions table
  - Add session validation middleware
- **Acceptance Criteria:**
  - Users can initiate Google sign-in
  - OAuth callback correctly creates/updates user record
  - Session cookie is set securely (httpOnly, secure, sameSite)
  - Sessions persist across page reloads

#### Issue 1.2: Create protected route middleware (backend)
- **Estimate:** 3h
- **Description:**
  - Create tRPC middleware to verify session cookies
  - Add user context to tRPC procedures
  - Handle unauthorized access (401 errors)
  - Add refresh token logic if needed
- **Acceptance Criteria:**
  - Middleware correctly validates session cookies
  - Protected procedures return 401 for unauthenticated requests
  - User object available in tRPC context

#### Issue 1.3: Build login page with Google sign-in button
- **Estimate:** 3h
- **Description:**
  - Create login page component
  - Add Google sign-in button (using official branding)
  - Handle OAuth redirect flow
  - Show loading states during authentication
  - Add error handling for failed logins
- **Acceptance Criteria:**
  - Clean, minimal login page
  - Google button follows brand guidelines
  - Loading spinner during auth
  - Error messages displayed to user

#### Issue 1.4: Add user profile display in header/navbar
- **Estimate:** 2h
- **Description:**
  - Fetch current user from tRPC context
  - Display user avatar and name in navbar
  - Add dropdown menu for user actions
  - Handle loading and error states
- **Acceptance Criteria:**
  - User's Google avatar displayed in header
  - Name shown in dropdown
  - Graceful loading state

#### Issue 1.5: Implement logout functionality
- **Estimate:** 2h
- **Description:**
  - Create logout tRPC endpoint
  - Clear session cookie on logout
  - Delete session from database
  - Redirect to login page after logout
  - Add logout button to user dropdown
- **Acceptance Criteria:**
  - Logout button in user menu
  - Session cleared from database
  - Cookie removed from browser
  - User redirected to login page

---

## **EPIC 2: Core Journal Entry System [P0]** 📝

**Goal:** Users can create, view, and delete journal entries

**Why:** This is the core functionality of the app

**Technical Approach:**
- PostgreSQL table: `journal_entries` with columns (id, userId, promptId, content, createdAt)
- tRPC procedures for CRUD operations
- React form with validation
- List view with pagination

### Issues:

#### Issue 2.1: Create JournalEntry database table & Zod schemas
- **Estimate:** 3h
- **Description:**
  - Create `JournalEntry` table class extending BaseTable
  - Add columns: id, userId (FK to user), promptId (FK to prompt), content (text), createdAt, updatedAt
  - Create Zod schemas for validation in `@repo/zod-schemas`
  - Add indexes for userId and createdAt
  - Run migration to create table
- **Acceptance Criteria:**
  - Table created in PostgreSQL
  - Foreign keys properly configured
  - Zod schemas exported for reuse
  - Cascade delete when user is deleted

#### Issue 2.2: Build tRPC endpoints (create, getAll, getById, delete)
- **Estimate:** 5h
- **Description:**
  - `journalEntry.create` - Create new entry (requires auth)
  - `journalEntry.getAll` - Get user's entries with pagination
  - `journalEntry.getById` - Get single entry by ID
  - `journalEntry.delete` - Delete entry (verify ownership)
  - Include prompt information in responses (join query)
  - Add error handling for not found / unauthorized
- **Acceptance Criteria:**
  - All endpoints validate user ownership
  - Pagination works (offset/limit)
  - Joined prompt data included in responses
  - Proper error messages for invalid requests

#### Issue 2.3: Create journal entry submission form component
- **Estimate:** 4h
- **Description:**
  - Build form with textarea for entry content
  - Display current prompt at top of form
  - Add character count indicator
  - Implement form validation with react-hook-form
  - Show loading state during submission
  - Clear form on successful submit
  - Handle errors gracefully
- **Acceptance Criteria:**
  - Clean, minimal form design
  - Prompt displayed prominently
  - Character counter updates in real-time
  - Success/error notifications shown
  - Form resets after submission

#### Issue 2.4: Build journal entry list/history view
- **Estimate:** 4h
- **Description:**
  - Create list component showing user's entries
  - Display entry preview (first 100 chars), date, and prompt
  - Add pagination controls
  - Show empty state for no entries
  - Add click handler to view full entry
- **Acceptance Criteria:**
  - Entries sorted by date (newest first)
  - Pagination works smoothly
  - Empty state with helpful message
  - Clicking entry navigates to detail view

#### Issue 2.5: Add entry detail view page
- **Estimate:** 3h
- **Description:**
  - Create detail page showing full entry content
  - Display prompt that was answered
  - Show creation date/time
  - Add edit button (future enhancement)
  - Add delete button with confirmation
- **Acceptance Criteria:**
  - Full entry content displayed
  - Prompt question shown
  - Date formatted nicely
  - Delete confirmation dialog prevents accidents

#### Issue 2.6: Implement delete entry functionality
- **Estimate:** 2h
- **Description:**
  - Add delete button to entry detail page
  - Show confirmation modal before deletion
  - Call tRPC delete endpoint
  - Redirect to list after successful delete
  - Show success notification
- **Acceptance Criteria:**
  - Confirmation modal prevents accidental deletes
  - Entry removed from database
  - User redirected to entry list
  - Success message shown

---

## **EPIC 3: Prompt System [P0]** 💭

**Goal:** Users receive thought-provoking prompts to answer

**Why:** Prompts solve the "blank page problem" and guide reflection

**Technical Approach:**
- PostgreSQL table: `prompts` with seed data
- API to fetch daily/random prompt
- Admin panel to add/edit prompts
- Link prompts to journal entries

### Issues:

#### Issue 3.1: Create Prompt database table & seed with 50+ prompts
- **Estimate:** 4h
- **Description:**
  - Create `Prompt` table (id, text, category, isActive, createdAt)
  - Create Zod schema for prompt validation
  - Write seed script with 50+ diverse prompts
  - Categorize prompts (morning, evening, reflection, gratitude, etc.)
  - Run migration and seed
- **Acceptance Criteria:**
  - Table created with proper schema
  - At least 50 quality prompts seeded
  - Prompts categorized appropriately
  - All prompts marked as active

#### Issue 3.2: Build prompt delivery API (random/daily rotation)
- **Estimate:** 4h
- **Description:**
  - Create `prompt.getDailyPrompt` tRPC endpoint
  - Implement logic to select prompt (random or sequential)
  - Consider user timezone for "daily" calculation
  - Track which prompts user has seen (optional for v1)
  - Return prompt object with id and text
- **Acceptance Criteria:**
  - Endpoint returns different prompt each day
  - Same prompt returned for same day/user
  - Only active prompts selected
  - Graceful handling if no prompts available

#### Issue 3.3: Create prompt display component (simple & clean)
- **Estimate:** 3h
- **Description:**
  - Build component to display current prompt
  - Use large, readable typography
  - Add subtle visual styling (card, gradient, etc.)
  - Show "Write your response" call-to-action
  - Add icon or illustration
- **Acceptance Criteria:**
  - Prompt text is prominent and readable
  - Component is visually appealing
  - CTA button leads to entry form
  - Responsive on mobile

#### Issue 3.4: Link prompt ID to journal entries
- **Estimate:** 2h
- **Description:**
  - Update journal entry creation to accept promptId
  - Pass current prompt ID when creating entry
  - Update entry list/detail to show which prompt was answered
  - Handle cases where prompt is deleted (show null gracefully)
- **Acceptance Criteria:**
  - Entry creation stores promptId
  - Entry list shows prompt question
  - Detail view shows full prompt
  - Handles missing prompts gracefully

#### Issue 3.5: Build basic admin panel for prompt management
- **Estimate:** 4h
- **Description:**
  - Create admin page (simple auth check for now)
  - List all prompts with edit/delete actions
  - Add form to create new prompts
  - Allow activating/deactivating prompts
  - Simple table view with actions
- **Acceptance Criteria:**
  - Admin can view all prompts
  - Can add new prompts via form
  - Can edit existing prompts
  - Can toggle active status
  - Only accessible to admin users

---

## **EPIC 4: Scheduling & Email Notifications [P0]** ⏰

**Goal:** Users receive email notifications with prompts at scheduled times

**Why:** Consistent reminders drive habit formation

**Technical Approach:**
- PostgreSQL table: `user_schedules` (userId, time, timezone, frequency)
- Cron job (node-cron or similar) runs every minute
- Check for users with matching schedule time
- Send email via SendGrid/Resend
- Email contains prompt + link to app

### Issues:

#### Issue 4.1: Create UserSchedule table (time, timezone, frequency)
- **Estimate:** 3h
- **Description:**
  - Create `UserSchedule` table (id, userId, scheduledTime, timezone, isActive, frequency)
  - Support daily frequency for MVP
  - Store time as string (e.g., "08:00", "20:00")
  - Store timezone (e.g., "America/New_York")
  - Add unique constraint on userId (one schedule per user for MVP)
- **Acceptance Criteria:**
  - Table created with proper schema
  - Timezone support validated
  - Foreign key to users table
  - Default schedule can be set

#### Issue 4.2: Build schedule management tRPC endpoints
- **Estimate:** 4h
- **Description:**
  - `schedule.get` - Get user's current schedule
  - `schedule.upsert` - Create or update schedule
  - `schedule.delete` - Remove schedule
  - Validate timezone against known timezones
  - Validate time format (HH:MM)
- **Acceptance Criteria:**
  - Endpoints validate input properly
  - Timezone validation works
  - User can only modify their own schedule
  - Returns clear error messages

#### Issue 4.3: Create schedule settings UI page
- **Estimate:** 5h
- **Description:**
  - Build settings page for notification schedule
  - Time picker for scheduled time
  - Timezone selector (use library like react-timezone-select)
  - Toggle to enable/disable notifications
  - Save button calls tRPC endpoint
  - Show current settings on load
- **Acceptance Criteria:**
  - Clean, intuitive UI
  - Time picker easy to use
  - Timezone auto-detected if possible
  - Changes saved successfully
  - Confirmation message on save

#### Issue 4.4: Set up email service (SendGrid or Resend)
- **Estimate:** 3h
- **Description:**
  - Create account with email provider (SendGrid or Resend)
  - Install SDK and configure API keys
  - Create email utility function
  - Design simple HTML email template
  - Test sending emails in development
- **Acceptance Criteria:**
  - Email service configured
  - Can send test emails
  - Template looks good on mobile
  - Sender domain verified (or using sandbox)

#### Issue 4.5: Implement cron job for scheduled notifications
- **Estimate:** 5h
- **Description:**
  - Set up node-cron in backend
  - Job runs every minute
  - Query users with active schedules matching current time (in their timezone)
  - Fetch daily prompt for each user
  - Send email with prompt
  - Log successful sends and errors
  - Handle rate limits and retries
- **Acceptance Criteria:**
  - Cron job runs reliably
  - Correctly converts timezones
  - Emails sent at scheduled time (±1 min)
  - Errors logged but don't crash backend
  - No duplicate sends

#### Issue 4.6: Create email template for prompts
- **Estimate:** 3h
- **Description:**
  - Design HTML email template
  - Include prompt text prominently
  - Add "Write your response" CTA button linking to app
  - Include unsubscribe/settings link
  - Make responsive for mobile
  - Test in various email clients
- **Acceptance Criteria:**
  - Email looks professional
  - CTA button works correctly
  - Responsive on mobile email clients
  - Unsubscribe link functional
  - Branding consistent with app

---

## **EPIC 5: Search & Dashboard [P0]** 🔍

**Goal:** Users can search past entries and view activity dashboard

**Why:** Enables reflection and makes journal useful long-term

**Technical Approach:**
- PostgreSQL full-text search on entry content
- Filter by date range, keywords
- Dashboard shows stats (total entries, current streak, recent activity)
- Calendar view optional for MVP

### Issues:

#### Issue 5.1: Implement backend search (full-text search on entries)
- **Estimate:** 5h
- **Description:**
  - Create `journalEntry.search` tRPC endpoint
  - Accept query params: keyword, dateFrom, dateTo, limit, offset
  - Use PostgreSQL full-text search (tsvector) or simple ILIKE for MVP
  - Filter by userId (user can only search their entries)
  - Return matching entries with highlighted snippets
  - Order by relevance or date
- **Acceptance Criteria:**
  - Search returns relevant results
  - Date range filtering works
  - Pagination implemented
  - Fast query performance (<500ms)
  - Only user's entries returned

#### Issue 5.2: Build search UI with filters (date range, keywords)
- **Estimate:** 5h
- **Description:**
  - Create search page with search bar
  - Add date range picker (from/to dates)
  - Display search results in list format
  - Highlight matching keywords in results
  - Show "no results" state
  - Add clear filters button
- **Acceptance Criteria:**
  - Search bar autocompletes/suggests
  - Date pickers easy to use
  - Results update on filter change
  - Keywords highlighted in results
  - Responsive on mobile

#### Issue 5.3: Create user dashboard (recent entries, stats)
- **Estimate:** 5h
- **Description:**
  - Build dashboard page (home page after login)
  - Show total entries count
  - Display recent 5 entries
  - Show current streak (if gamification ready)
  - Add quick access to create entry
  - Show last login/activity
- **Acceptance Criteria:**
  - Dashboard loads quickly
  - Stats are accurate
  - Recent entries displayed nicely
  - CTA to create entry prominent
  - Responsive layout

#### Issue 5.4: Add calendar view for entries
- **Estimate:** 4h
- **Description:**
  - Create calendar component (use library like react-big-calendar or build simple one)
  - Mark dates with entries
  - Click date to view entries from that day
  - Highlight current date
  - Navigate between months
- **Acceptance Criteria:**
  - Calendar displays entries accurately
  - Clicking date shows entries
  - Easy to navigate months
  - Visual indicator for days with entries
  - Mobile-friendly

---

## **EPIC 6: Testing Infrastructure [P0]** ✅

**Goal:** Comprehensive test coverage for backend and frontend

**Why:** Enables confident development with AI/LLM assistance and prevents regressions

**Technical Approach:**
- Vitest for both backend and frontend
- API tests for all tRPC endpoints
- Component tests for key UI components
- Coverage reporting in CI

### Issues:

#### Issue 6.1: Set up Vitest for backend with example tests
- **Estimate:** 4h
- **Description:**
  - Install Vitest and testing utilities
  - Configure vitest.config.ts for backend
  - Set up test database (separate from dev)
  - Create helper utilities (test DB setup/teardown)
  - Write example test for one tRPC endpoint
  - Add test script to package.json
- **Acceptance Criteria:**
  - Vitest runs successfully
  - Test database isolated
  - Example test passes
  - Can run `yarn test` in apps/backend

#### Issue 6.2: Write API endpoint tests (auth, journal CRUD)
- **Estimate:** 6h
- **Description:**
  - Test auth endpoints (login, logout, session validation)
  - Test journal entry CRUD (create, getAll, getById, delete)
  - Test prompt endpoints (getDailyPrompt)
  - Test schedule endpoints (get, upsert, delete)
  - Mock external services (email, OAuth)
  - Achieve >80% coverage on endpoints
- **Acceptance Criteria:**
  - All major endpoints tested
  - Tests cover success and error cases
  - Mocks prevent external calls
  - Coverage >80%

#### Issue 6.3: Set up Vitest for frontend component tests
- **Estimate:** 4h
- **Description:**
  - Install Vitest + React Testing Library
  - Configure vitest.config.ts for frontend
  - Set up test utilities (render with providers)
  - Mock tRPC client for tests
  - Write example component test
  - Add test script to package.json
- **Acceptance Criteria:**
  - Vitest runs in frontend
  - RTL configured properly
  - tRPC mocked successfully
  - Example test passes
  - Can run `yarn test` in apps/frontend

#### Issue 6.4: Write React component tests (forms, lists)
- **Estimate:** 6h
- **Description:**
  - Test journal entry form (submission, validation)
  - Test entry list (rendering, pagination)
  - Test search component (filters, results)
  - Test dashboard components
  - Test login flow
  - Achieve >70% coverage
- **Acceptance Criteria:**
  - Key components tested
  - User interactions tested (clicks, form input)
  - Tests cover happy path and errors
  - Coverage >70%

#### Issue 6.5: Add test coverage reporting to CI
- **Estimate:** 2h
- **Description:**
  - Configure Vitest coverage collection
  - Add coverage thresholds (80% backend, 70% frontend)
  - Update GitHub Actions to run tests with coverage
  - Upload coverage reports (Codecov or similar)
  - Add coverage badge to README
- **Acceptance Criteria:**
  - Coverage reports generated
  - CI fails if coverage drops
  - Coverage visible in PR comments
  - Badge shows in README

---

## **EPIC 7: PWA Support [P0]** 📱

**Goal:** App installable as PWA with offline support

**Why:** Mobile-first experience without app store complexity

**Technical Approach:**
- Vite PWA plugin for service worker
- Web app manifest with icons
- Cache-first strategy for assets
- localStorage fallback for offline entry creation

### Issues:

#### Issue 7.1: Configure Vite PWA plugin & web manifest
- **Estimate:** 4h
- **Description:**
  - Install vite-plugin-pwa
  - Configure plugin in vite.config.ts
  - Create web app manifest (name, description, icons, colors)
  - Generate app icons (512x512, 192x192, etc.)
  - Configure start_url and display mode
  - Test manifest validation
- **Acceptance Criteria:**
  - PWA manifest valid
  - Icons display correctly
  - App name and colors set
  - Lighthouse PWA audit passes

#### Issue 7.2: Set up service worker for offline caching
- **Estimate:** 4h
- **Description:**
  - Configure workbox strategies in PWA plugin
  - Cache static assets (CSS, JS, fonts)
  - Cache API responses (with expiration)
  - Implement offline fallback page
  - Test offline functionality
- **Acceptance Criteria:**
  - Static assets cached
  - App loads offline (cached version)
  - API responses cached appropriately
  - Offline fallback shows when needed

#### Issue 7.3: Add localStorage for offline entry drafts
- **Estimate:** 4h
- **Description:**
  - Save entry drafts to localStorage as user types
  - Show indicator when offline
  - Queue offline-created entries
  - Sync queued entries when back online
  - Clear localStorage after successful sync
- **Acceptance Criteria:**
  - Drafts persist across page reloads
  - Offline indicator visible
  - Entries created offline sync when online
  - No data loss in offline mode

#### Issue 7.4: Create install prompt UI component
- **Estimate:** 3h
- **Description:**
  - Detect if app is installable
  - Show install banner/prompt
  - Handle beforeinstallprompt event
  - Dismiss prompt if user declines
  - Don't show again if already installed
- **Acceptance Criteria:**
  - Install prompt appears when eligible
  - Clicking prompt triggers install
  - Prompt dismissed properly
  - Works on Chrome, Safari, Firefox

#### Issue 7.5: Test PWA installation on mobile browsers
- **Estimate:** 2h
- **Description:**
  - Test installation on Chrome (Android)
  - Test installation on Safari (iOS)
  - Verify offline functionality on mobile
  - Test add to home screen
  - Check icon and splash screen
- **Acceptance Criteria:**
  - Installs successfully on Android
  - Installs successfully on iOS
  - Icon appears on home screen
  - Splash screen displays
  - Offline mode works on mobile

---

## **EPIC 8: Mobile App with Capacitor [P1]** 📲

**Goal:** Native iOS and Android apps using Capacitor

**Why:** Better mobile experience with native features

**Technical Approach:**
- Use existing React frontend
- Add Capacitor to create native wrapper
- Implement native push notifications
- Build and test on physical devices

### Issues:

#### Issue 12.1: Initialize Capacitor project in monorepo
- **Estimate:** 4h
- **Description:**
  - Install Capacitor CLI
  - Initialize Capacitor in apps/frontend
  - Configure capacitor.config.ts
  - Add iOS and Android platforms
  - Sync web assets to native projects
  - Test basic app launch
- **Acceptance Criteria:**
  - Capacitor initialized
  - iOS and Android folders created
  - App launches in simulators
  - Web assets sync correctly

#### Issue 12.2: Configure Android build environment
- **Estimate:** 5h
- **Description:**
  - Install Android Studio
  - Configure Gradle build
  - Set up app signing (debug and release)
  - Configure app permissions (notifications, internet)
  - Update app icon and splash screen
  - Build debug APK
- **Acceptance Criteria:**
  - Android Studio opens project
  - Debug build succeeds
  - APK installs on emulator
  - App icon and splash correct

#### Issue 12.3: Configure iOS build environment
- **Estimate:** 5h
- **Description:**
  - Install Xcode
  - Configure iOS project settings
  - Set up code signing (development)
  - Configure app permissions (notifications, internet)
  - Update app icon and launch screen
  - Build to iOS simulator
- **Acceptance Criteria:**
  - Xcode opens project
  - Simulator build succeeds
  - App runs on iOS simulator
  - App icon and launch screen correct

#### Issue 12.4: Implement native push notifications (Android FCM)
- **Estimate:** 6h
- **Description:**
  - Set up Firebase Cloud Messaging
  - Install Capacitor push notification plugin
  - Configure Android push notification setup
  - Request notification permissions
  - Handle notification received
  - Test notification delivery
- **Acceptance Criteria:**
  - Permissions requested properly
  - Notifications received on Android
  - Tapping notification opens app
  - Works in background and foreground

#### Issue 12.5: Implement native push notifications (iOS APNs)
- **Estimate:** 6h
- **Description:**
  - Configure Apple Push Notification service
  - Set up push certificates
  - Configure iOS push in Capacitor
  - Request notification permissions
  - Handle notification received
  - Test notification delivery
- **Acceptance Criteria:**
  - Permissions requested properly
  - Notifications received on iOS
  - Tapping notification opens app
  - Works in background and foreground

#### Issue 12.6: Add native share functionality
- **Estimate:** 3h
- **Description:**
  - Install Capacitor Share plugin
  - Add share button to entry detail
  - Share entry text via native share sheet
  - Test on Android and iOS
- **Acceptance Criteria:**
  - Share button visible
  - Native share sheet appears
  - Entry text shared correctly
  - Works on both platforms

#### Issue 12.7: Create app icons & splash screens
- **Estimate:** 3h
- **Description:**
  - Design app icon (1024x1024)
  - Generate all required sizes
  - Design splash screen
  - Use capacitor-assets to generate
  - Update Android and iOS projects
- **Acceptance Criteria:**
  - Icon looks good at all sizes
  - Splash screen displays on launch
  - Branding consistent
  - No placeholder icons remain

#### Issue 12.8: Test on Android physical device
- **Estimate:** 3h
- **Description:**
  - Build release APK
  - Install on Android phone
  - Test all features (auth, entries, notifications)
  - Check performance
  - Verify offline mode works
- **Acceptance Criteria:**
  - App installs successfully
  - All features work
  - Performance acceptable
  - No crashes

#### Issue 12.9: Test on iOS physical device
- **Estimate:** 3h
- **Description:**
  - Build to connected iPhone
  - Install via Xcode
  - Test all features (auth, entries, notifications)
  - Check performance
  - Verify offline mode works
- **Acceptance Criteria:**
  - App installs successfully
  - All features work
  - Performance acceptable
  - No crashes

---

## **EPIC 8: CI/CD & Deployment [P0]** 🚀

**Goal:** Automated testing and deployment pipeline

**Why:** Fast, reliable deployments with confidence

**Technical Approach:**
- GitHub Actions for CI/CD
- Lint, test, build on every PR
- Deploy to staging on main branch
- Manual approval for production
- Environment variable management

### Issues:

#### Issue 8.1: Create GitHub Actions workflow (lint + test)
- **Estimate:** 3h
- **Description:**
  - Create .github/workflows/ci.yml
  - Run on pull requests and main branch
  - Set up Node.js and Yarn
  - Run lint (Biome)
  - Run type checking
  - Run tests with coverage
  - Cache node_modules and Turbo cache
- **Acceptance Criteria:**
  - Workflow runs on PRs
  - Lint failures block merge
  - Test failures block merge
  - Runs complete in <5 minutes

#### Issue 8.2: Add build workflow for frontend & backend
- **Estimate:** 3h
- **Description:**
  - Extend CI workflow to include build step
  - Build frontend (apps/frontend)
  - Build backend (apps/backend)
  - Verify build artifacts created
  - Fail if build has errors
- **Acceptance Criteria:**
  - Both apps build successfully
  - Build failures block merge
  - Build artifacts verified
  - Works on all supported Node versions

#### Issue 8.3: Set up staging environment (Vercel/Railway/Render)
- **Estimate:** 5h
- **Description:**
  - Choose hosting provider (Vercel for frontend, Railway/Render for backend)
  - Create staging environment
  - Configure environment variables
  - Set up PostgreSQL database (staging)
  - Deploy frontend to staging
  - Deploy backend to staging
  - Test end-to-end on staging
- **Acceptance Criteria:**
  - Staging environment accessible
  - Database migrations applied
  - Environment variables configured
  - Full app functional on staging

#### Issue 8.4: Configure production deployment
- **Estimate:** 4h
- **Description:**
  - Create production environment
  - Set up production PostgreSQL database
  - Configure production environment variables
  - Set up custom domain (if available)
  - Add SSL/TLS certificates
  - Deploy to production
- **Acceptance Criteria:**
  - Production environment live
  - Custom domain configured (optional)
  - HTTPS enabled
  - Database properly configured

#### Issue 8.5: Set up environment secrets management
- **Estimate:** 2h
- **Description:**
  - Document all required environment variables
  - Create .env.example files
  - Use GitHub Secrets for CI/CD
  - Set up secrets in hosting platforms
  - Add secret rotation plan
- **Acceptance Criteria:**
  - All secrets documented
  - .env.example up to date
  - Secrets configured in all environments
  - No secrets committed to repo

#### Issue 8.6: Add deployment status badges to README
- **Estimate:** 1h
- **Description:**
  - Add CI/CD status badge
  - Add deployment status (staging, production)
  - Add test coverage badge
  - Update README with deployment info
- **Acceptance Criteria:**
  - Badges display correctly
  - Status updates automatically
  - README clearly documents deployment

---

## **EPIC 9: Monitoring & Error Tracking [P0]** 📊

**Goal:** Real-time error tracking and performance monitoring

**Why:** Catch and fix issues before users complain

**Technical Approach:**
- Sentry for error tracking (backend + frontend)
- Frontend RUM for performance metrics
- Connect frontend errors to backend traces via trace IDs
- Alert on high error rates

### Issues:

#### Issue 9.1: Integrate Sentry for backend error tracking
- **Estimate:** 3h
- **Description:**
  - Create Sentry account and project
  - Install @sentry/node
  - Initialize Sentry in backend.ts
  - Configure error sampling
  - Test error reporting
  - Set up source maps for better stack traces
- **Acceptance Criteria:**
  - Sentry initialized
  - Errors reported to Sentry
  - Source maps uploaded
  - User context attached to errors

#### Issue 9.2: Add Sentry for frontend error tracking
- **Estimate:** 3h
- **Description:**
  - Install @sentry/react
  - Initialize Sentry in frontend
  - Configure error boundary integration
  - Set up breadcrumbs
  - Test error reporting
  - Upload source maps
- **Acceptance Criteria:**
  - Frontend errors reported
  - React error boundaries integrated
  - User context captured
  - Source maps working

#### Issue 9.3: Set up frontend RUM (Real User Monitoring)
- **Estimate:** 4h
- **Description:**
  - Enable Sentry Performance Monitoring
  - Track page load times
  - Track API request durations
  - Track Core Web Vitals (LCP, FID, CLS)
  - Set performance budgets
- **Acceptance Criteria:**
  - Performance data visible in Sentry
  - Page loads tracked
  - API requests tracked
  - Core Web Vitals monitored

#### Issue 9.4: Connect frontend errors to backend trace IDs
- **Estimate:** 4h
- **Description:**
  - Generate trace IDs in backend (OpenTelemetry)
  - Return trace IDs in API responses (headers)
  - Attach trace IDs to frontend errors
  - Link errors across frontend/backend in Sentry
  - Test full trace from frontend to backend
- **Acceptance Criteria:**
  - Trace IDs generated in backend
  - Frontend captures trace IDs
  - Errors linked across services
  - Can trace request end-to-end

#### Issue 9.5: Create basic alerting rules (error rate thresholds)
- **Estimate:** 3h
- **Description:**
  - Configure Sentry alerts for high error rates
  - Alert on new error types
  - Set up notification channels (email, Slack)
  - Define alert thresholds (e.g., >10 errors/min)
  - Test alert triggers
- **Acceptance Criteria:**
  - Alerts configured in Sentry
  - Notifications sent correctly
  - Thresholds appropriate
  - Alerts actionable

---

## **EPIC 10: Gamification System [P1]** 🏆

**Goal:** Streaks and badges to motivate consistent journaling

**Why:** Increases user retention and habit formation

**Technical Approach:**
- Track daily journal entry streaks
- Award badges for milestones (7, 30, 100, 365 days)
- Display current streak prominently
- Push notifications for streak milestones

### Issues:

#### Issue 10.1: Create Streak & Badge database tables
- **Estimate:** 3h
- **Description:**
  - Create `UserStreak` table (userId, currentStreak, longestStreak, lastEntryDate)
  - Create `Badge` table (id, name, description, iconUrl, milestoneValue)
  - Create `UserBadge` junction table (userId, badgeId, awardedAt)
  - Seed badges (7-day, 30-day, 100-day, 365-day streaks)
  - Add migrations
- **Acceptance Criteria:**
  - Tables created with proper schema
  - Foreign keys configured
  - Badges seeded with data
  - Indexes on userId

#### Issue 10.2: Implement streak calculation logic (daily tracking)
- **Estimate:** 5h
- **Description:**
  - Create background job or hook on entry creation
  - Calculate if entry extends current streak
  - Reset streak if >24h gap (consider timezone)
  - Update currentStreak and longestStreak
  - Handle edge cases (multiple entries same day, timezone changes)
- **Acceptance Criteria:**
  - Streak increments on consecutive days
  - Streak resets after missed day
  - Timezone-aware calculations
  - Multiple entries same day don't duplicate

#### Issue 10.3: Create badge definitions (7-day, 30-day, 365-day streaks)
- **Estimate:** 3h
- **Description:**
  - Define badge metadata (names, descriptions)
  - Create or find badge icons/images
  - Implement badge award logic
  - Check if user qualifies for badges after each entry
  - Prevent duplicate awards
- **Acceptance Criteria:**
  - At least 5 badge types defined
  - Icons visually appealing
  - Awards triggered correctly
  - No duplicate awards

#### Issue 10.4: Build gamification tRPC endpoints
- **Estimate:** 4h
- **Description:**
  - `gamification.getStreak` - Get user's current streak
  - `gamification.getBadges` - Get user's earned badges
  - `gamification.getLeaderboard` (optional) - Top streaks
  - Include streak in user profile response
- **Acceptance Criteria:**
  - Endpoints return accurate data
  - Fast queries (<100ms)
  - User can only see their own streaks
  - Leaderboard optional for MVP

#### Issue 10.5: Design & implement streak UI component
- **Estimate:** 5h
- **Description:**
  - Create streak display component
  - Show current streak number prominently
  - Display flame/fire icon
  - Show longest streak
  - Add motivational message
  - Animate streak increment
- **Acceptance Criteria:**
  - Visually appealing design
  - Current streak prominent
  - Animation on streak increase
  - Responsive on mobile

#### Issue 10.6: Create badge showcase page
- **Estimate:** 4h
- **Description:**
  - Build page displaying all badges
  - Show earned badges (colored)
  - Show locked badges (grayscale)
  - Display progress to next badge
  - Add badge details on click
- **Acceptance Criteria:**
  - Grid layout of badges
  - Clear earned vs. locked state
  - Progress bars for next badge
  - Mobile-friendly layout

#### Issue 10.7: Add push notifications for milestones
- **Estimate:** 4h
- **Description:**
  - Detect when badge is awarded
  - Send push notification (email for MVP)
  - Congratulate user on milestone
  - Include badge image in email
  - Add CTA to view badges
- **Acceptance Criteria:**
  - Notification sent when badge earned
  - Email looks celebratory
  - CTA links to badge page
  - No duplicate notifications

---

## **EPIC 11: Payments & Subscriptions [P1]** 💳

**Goal:** Monetize app with paid subscriptions (ad-free + cloud sync)

**Why:** Revenue to sustain development and growth

**Technical Approach:**
- Stripe for web payments
- Google Play Billing for Android
- Apple In-App Purchase for iOS
- Unified subscription status in backend
- Free tier vs. Paid tier features

### Issues:

#### Issue 12.1: Design subscription tiers schema (free/paid)
- **Estimate:** 3h
- **Description:**
  - Create `Subscription` table (userId, tier, status, expiresAt, provider)
  - Define tier enum (FREE, PAID)
  - Define status enum (ACTIVE, EXPIRED, CANCELED)
  - Store provider (STRIPE, GOOGLE_PLAY, APPLE)
  - Add middleware to check subscription status
- **Acceptance Criteria:**
  - Table schema supports multiple providers
  - Status tracking works
  - Middleware blocks paid features for free users

#### Issue 12.2: Integrate Stripe for web payments
- **Estimate:** 6h
- **Description:**
  - Create Stripe account
  - Install Stripe SDK
  - Create subscription products in Stripe
  - Implement checkout session creation
  - Build checkout page
  - Handle successful payment callback
  - Update user subscription in database
- **Acceptance Criteria:**
  - Checkout flow works end-to-end
  - Successful payments create subscription
  - User upgraded to paid tier
  - Test mode transactions succeed

#### Issue 12.3: Build subscription management UI
- **Estimate:** 6h
- **Description:**
  - Create subscription settings page
  - Show current plan and status
  - Display next billing date
  - Add upgrade button (free users)
  - Add cancel subscription button (paid users)
  - Show payment history
- **Acceptance Criteria:**
  - Clear display of current plan
  - Upgrade flow smooth
  - Cancellation works
  - Payment history accurate

#### Issue 12.4: Implement webhook handlers for Stripe events
- **Estimate:** 5h
- **Description:**
  - Create webhook endpoint
  - Verify Stripe signatures
  - Handle checkout.session.completed
  - Handle customer.subscription.updated
  - Handle customer.subscription.deleted
  - Update database on each event
  - Log all webhook events
- **Acceptance Criteria:**
  - Webhooks verified securely
  - Subscription status updated
  - Cancellations handled
  - Webhook logs for debugging

#### Issue 12.5: Add subscription status middleware
- **Estimate:** 3h
- **Description:**
  - Create tRPC middleware to check subscription
  - Add `requiresPaid` middleware
  - Block paid features for free users
  - Return clear error messages
  - Check subscription expiration
- **Acceptance Criteria:**
  - Paid endpoints protected
  - Free users blocked gracefully
  - Error messages helpful
  - Expired subscriptions handled

#### Issue 12.6: Create billing history page
- **Estimate:** 4h
- **Description:**
  - Fetch payment history from Stripe
  - Display invoices with dates and amounts
  - Add download invoice links
  - Show payment method
  - Handle refunds and credits
- **Acceptance Criteria:**
  - History accurate and complete
  - Download links work
  - Responsive layout
  - Handles edge cases

#### Issue 12.7: Integrate Google Play Billing SDK
- **Estimate:** 6h
- **Description:**
  - Set up Google Play Console
  - Create subscription product
  - Integrate billing library (React Native)
  - Implement purchase flow
  - Verify purchases backend-side
  - Update subscription status
- **Acceptance Criteria:**
  - Android users can subscribe
  - Purchases verified on backend
  - Subscription status synced
  - Test purchases work

#### Issue 12.8: Integrate Apple In-App Purchase
- **Estimate:** 6h
- **Description:**
  - Set up App Store Connect
  - Create subscription product
  - Integrate StoreKit (React Native)
  - Implement purchase flow
  - Verify receipts backend-side
  - Update subscription status
- **Acceptance Criteria:**
  - iOS users can subscribe
  - Receipts validated on backend
  - Subscription status synced
  - Sandbox testing works

---

## **EPIC 13: Advanced Features & Polish [P1]** ✨

**Goal:** Cloud sync, data export, advanced settings, and performance

**Why:** Premium features for paid users and overall polish

**Technical Approach:**
- Cloud backup to S3/Cloud Storage (paid only)
- IndexedDB for robust offline storage
- Sync queue with conflict resolution
- CDN for static assets
- Performance optimizations

### Issues:

#### Issue 13.1: Implement cloud backup for paid users
- **Estimate:** 6h
- **Description:**
  - Set up S3 or similar cloud storage
  - Create backup API endpoint (paid users only)
  - Encrypt journal data before upload
  - Schedule automatic backups (daily)
  - Add manual backup trigger
  - Test backup and restore
- **Acceptance Criteria:**
  - Paid users can backup
  - Free users blocked
  - Data encrypted
  - Automatic backups work
  - Restore tested

#### Issue 13.2: Add data export (JSON, CSV)
- **Estimate:** 4h
- **Description:**
  - Create export endpoint
  - Support JSON format (all data)
  - Support CSV format (entries only)
  - Include prompts in export
  - Add download button in settings
  - GDPR compliance
- **Acceptance Criteria:**
  - Export includes all user data
  - JSON format valid
  - CSV opens in Excel/Sheets
  - Download works
  - GDPR compliant

#### Issue 13.3: Create settings page (theme, notifications, account)
- **Estimate:** 5h
- **Description:**
  - Build comprehensive settings page
  - Theme toggle (light/dark mode)
  - Notification preferences
  - Account settings (email, password)
  - Privacy settings
  - Danger zone (delete account)
- **Acceptance Criteria:**
  - All settings functional
  - Theme persists
  - Account updates save
  - Delete account works with confirmation

#### Issue 13.4: Add IndexedDB for robust offline storage
- **Estimate:** 6h
- **Description:**
  - Install Dexie.js
  - Create IndexedDB schema
  - Store journal entries offline
  - Store prompts offline
  - Sync with backend periodically
  - Replace localStorage
- **Acceptance Criteria:**
  - IndexedDB initialized
  - Entries stored offline
  - Syncs when online
  - Handles large datasets
  - Faster than localStorage

#### Issue 13.5: Implement sync queue for offline-created entries
- **Estimate:** 6h
- **Description:**
  - Queue offline operations
  - Retry failed syncs
  - Handle network reconnection
  - Show sync status indicator
  - Resolve conflicts (backend wins for MVP)
  - Test offline → online flow
- **Acceptance Criteria:**
  - Offline entries queued
  - Sync triggers on reconnect
  - Status indicator accurate
  - No data loss
  - Conflicts handled

#### Issue 13.6: Set up CDN for static assets (Cloudflare)
- **Estimate:** 4h
- **Description:**
  - Configure Cloudflare CDN
  - Upload static assets (images, fonts)
  - Configure cache headers
  - Update asset URLs to use CDN
  - Test asset delivery
  - Monitor cache hit rates
- **Acceptance Criteria:**
  - CDN configured
  - Assets served from CDN
  - Page load faster
  - Cache headers correct

#### Issue 13.7: Add database indexes for performance
- **Estimate:** 3h
- **Description:**
  - Analyze slow queries
  - Add indexes on userId columns
  - Add composite indexes (userId + createdAt)
  - Add index on search fields
  - Test query performance improvement
  - Document indexes
- **Acceptance Criteria:**
  - Slow queries identified
  - Indexes added
  - Queries 10x faster
  - No over-indexing

#### Issue 13.8: Implement GDPR data deletion
- **Estimate:** 5h
- **Description:**
  - Create account deletion endpoint
  - Delete all user data (cascade)
  - Remove from third-party services (Stripe, Sentry)
  - Send confirmation email
  - Add 30-day grace period (optional)
  - Log deletions for compliance
- **Acceptance Criteria:**
  - All user data deleted
  - Third-party data removed
  - Confirmation sent
  - Irreversible after grace period
  - GDPR compliant

---

## **EPIC 14: Advertising for Free Tier [P2]** 📢

**Goal:** Monetize free tier with non-intrusive ads

**Why:** Revenue from non-paying users

**Technical Approach:**
- Google AdSense for web
- Google AdMob for mobile
- Ad placement between journal entries
- Ad-free for paid users
- Comply with ad policies

### Issues:

#### Issue 14.1: Select ad provider (Google AdSense/AdMob)
- **Estimate:** 2h
- **Description:**
  - Research ad providers
  - Compare AdSense vs. AdMob vs. alternatives
  - Check compliance requirements
  - Create accounts
  - Get approval for app
- **Acceptance Criteria:**
  - Provider selected
  - Account created
  - App approved for ads
  - Ad units created

#### Issue 14.2: Integrate ads into web app
- **Estimate:** 4h
- **Description:**
  - Install AdSense SDK
  - Create ad components
  - Place ads between entries (non-intrusive)
  - Test ad display
  - Handle ad blockers gracefully
  - Ensure no ads for paid users
- **Acceptance Criteria:**
  - Ads display on web
  - Placement non-intrusive
  - Paid users see no ads
  - Ad blockers handled

#### Issue 14.3: Integrate AdMob for mobile app
- **Estimate:** 5h
- **Description:**
  - Install AdMob plugin
  - Configure Android ad units
  - Configure iOS ad units
  - Place banner or interstitial ads
  - Test on devices
  - Ensure no ads for paid users
- **Acceptance Criteria:**
  - Ads display on Android
  - Ads display on iOS
  - Placement appropriate
  - Paid users see no ads

#### Issue 14.4: Implement ad-free logic for paid users
- **Estimate:** 3h
- **Description:**
  - Check subscription status before showing ads
  - Hide ad components for paid users
  - Test upgrade flow (ads disappear)
  - Test subscription expiry (ads reappear)
- **Acceptance Criteria:**
  - Paid users never see ads
  - Free users see ads
  - Status checked reliably
  - Smooth transitions

#### Issue 14.5: Test ad compliance & policies
- **Estimate:** 3h
- **Description:**
  - Review ad placement policies
  - Ensure GDPR consent for ads (EU)
  - Add privacy policy updates
  - Test ad content appropriateness
  - Monitor for policy violations
- **Acceptance Criteria:**
  - Ads compliant with policies
  - GDPR consent obtained
  - Privacy policy updated
  - No policy violations

---

## Success Metrics

### MVP Launch (End of Week 3)
- [ ] Users can sign in with Google
- [ ] Users can create journal entries
- [ ] Users receive email notifications with prompts
- [ ] Users can search past entries
- [ ] App installable as PWA
- [ ] 80% test coverage on backend
- [ ] CI/CD pipeline operational
- [ ] Error monitoring active

### Post-MVP (Weeks 4-6)
- [ ] Streaks and badges implemented
- [ ] Paid subscriptions live (Stripe)
- [ ] Mobile apps in beta testing
- [ ] Cloud sync for paid users
- [ ] Ads displayed to free users

### Key Performance Indicators
- **Daily Active Users (DAU):** Target 1000 within 3 months
- **Retention Rate:** 40% Day 7, 20% Day 30
- **Conversion Rate:** 5% free → paid
- **Average Session Duration:** 3+ minutes
- **Crash-Free Rate:** >99.5%

---

## Technical Debt & Future Considerations

### Known Limitations (OK for MVP)
- No Redis (sessions in PostgreSQL or in-memory)
- Basic conflict resolution (backend wins)
- Email notifications only (no SMS, push for web initially)
- Simple prompt rotation (not personalized)

### Post-MVP Improvements
- Advanced prompt personalization (ML-based)
- Social features (share entries with friends)
- Voice journaling
- Rich text editor
- Multiple journals/categories
- Export to PDF with formatting
- Desktop apps (Tauri or Electron)

---

## Notes

- **All issues scoped to ≤6 hours** for manageable development
- **Parent-child structure** enables better tracking
- **Priority labels** (P0/P1/P2) guide execution order
- **Time estimates** help with sprint planning
- **Detailed acceptance criteria** ensure clarity

---

**Last Updated:** 2025-10-27
**Maintained By:** Development Team
