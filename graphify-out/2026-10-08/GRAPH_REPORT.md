# Graph Report - Verve2K26  (2026-10-08)

## Corpus Check
- 190 files · ~153,430 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .css 1)

## Summary
- 667 nodes · 1663 edges · 47 communities (24 shown, 23 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Core UI Components
- Student Events Dashboard
- Event Admin Actions
- Registration Core
- Event Creation Forms
- Date Utils
- User Management
- Package Dependencies
- Tailwind Config
- Package Metadata
- TypeScript Config
- Dev Dependencies
- Mock Data
- Toast Component
- Profile Settings
- Database Audit Scripts
- Registration Core Services
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 40

## God Nodes (most connected - your core abstractions)
1. `react` - 95 edges
2. `lucide-react` - 65 edges
3. `next` - 65 edges
4. `createClient()` - 42 edges
5. `@supabase/supabase-js` - 36 edges
6. `sonner` - 28 edges
7. `getAdminClient()` - 24 edges
8. `getCurrentUser` - 24 edges
9. `EventrixSelect()` - 23 edges
10. `dotenv` - 20 edges

## Surprising Connections (you probably didn't know these)
- `verifyGetFests()` --calls--> `getFests()`  [EXTRACTED]
  scratch/verify_get_fests.ts → src/actions/event.actions.ts
- `login()` --calls--> `createClient()`  [EXTRACTED]
  src/actions/auth.actions.ts → src/lib/supabase/server.ts
- `SignupPage()` --calls--> `signup()`  [EXTRACTED]
  src/app/(auth)/signup/page.tsx → src/actions/auth.actions.ts
- `signout()` --calls--> `createClient()`  [EXTRACTED]
  src/actions/auth.actions.ts → src/lib/supabase/server.ts
- `loadFest()` --calls--> `getFestById()`  [EXTRACTED]
  src/app/(admin)/admin/events/[id]/edit/page.tsx → src/actions/event.actions.ts

## Import Cycles
- None detected.

## Communities (47 total, 23 thin omitted)

### Community 0 - "Core UI Components"
Cohesion: 0.07
Nodes (36): html-to-image, qrcode.react, react, signout(), getParticipantRegistrations(), AdminLayout(), CoordinatorSettingsPage(), CoordinatorLayout() (+28 more)

### Community 1 - "Student Events Dashboard"
Cohesion: 0.07
Nodes (46): nextConfig, lucide-react, next, recharts, verifyGetFests(), getAdminParticipants(), getFests(), getStudentRegisteredEventIds() (+38 more)

### Community 2 - "Event Admin Actions"
Cohesion: 0.07
Nodes (48): papaparse, @supabase/supabase-js, sendTicketEmail(), approveAndPermitSubEvent(), approveSubEvent(), CoordinatorEventGroup, deleteFest(), deleteSubEvent() (+40 more)

### Community 3 - "Registration Core"
Cohesion: 0.08
Nodes (38): @base-ui/react, cn, @hookform/resolvers, react-hook-form, zod, createHackathonTeam(), getAdminClient(), getUserHackathonTeam() (+30 more)

### Community 4 - "Event Creation Forms"
Cohesion: 0.11
Nodes (39): sonner, createFest(), createSubEvent(), getSubEventById(), updateSubEvent(), deleteEventResourceAction(), EventResourceItem, getAdminClient() (+31 more)

### Community 5 - "Date Utils"
Cohesion: 0.11
Nodes (30): iso1, iso2, iso3, iso4, getCachedCoordinators, getFestById(), updateFest(), addHackathonPDF() (+22 more)

### Community 6 - "User Management"
Cohesion: 0.12
Nodes (27): createCoordinator(), deleteCoordinator(), deleteUserAccount(), getAdminClient(), getAllUsersAdmin(), getCoordinators(), login(), signup() (+19 more)

### Community 7 - "Package Dependencies"
Cohesion: 0.07
Nodes (29): dependencies, @azure/msal-browser, @base-ui/react, class-variance-authority, cn, framer-motion, @hookform/resolvers, html2canvas (+21 more)

### Community 8 - "Tailwind Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "Package Metadata"
Cohesion: 0.09
Nodes (21): name, private, version, @azure/msal-browser, class-variance-authority, framer-motion, html2canvas, @prisma/client (+13 more)

### Community 10 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 11 - "Dev Dependencies"
Cohesion: 0.14
Nodes (14): devDependencies, dotenv, eslint, eslint-config-next, sharp, tailwindcss, @tailwindcss/postcss, tsx (+6 more)

### Community 12 - "Mock Data"
Cohesion: 0.14
Nodes (13): EventCategory, FeaturedEvent, Fest, mockFeaturedEvents, mockFest, mockFestEvents, mockOverviewStats, mockRegistrations (+5 more)

### Community 13 - "Toast Component"
Cohesion: 0.28
Nodes (12): toast, ToastAction(), ToastClose(), ToastContent(), ToastDescription(), Toaster(), ToastIcon(), ToastList() (+4 more)

### Community 14 - "Profile Settings"
Cohesion: 0.31
Nodes (7): getAdminClient(), getProfileForUser(), updateAdminProfile(), updateProfile(), AdminSettingsPage(), AdminProfileForm(), AdminProfileFormProps

### Community 15 - "Database Audit Scripts"
Cohesion: 0.20
Nodes (3): adminClient, adminClient, adminClient

### Community 16 - "Registration Core Services"
Cohesion: 0.29
Nodes (7): qrcode, resend, POST(), supabase, resend, sendTicketEmail(), generateTicketQR()

### Community 17 - "Community 17"
Cohesion: 0.24
Nodes (3): SelectContent(), SelectScrollDownButton(), SelectScrollUpButton()

### Community 18 - "Community 18"
Cohesion: 0.28
Nodes (6): next-themes, anton, inter, metadata, RootLayout(), Toaster()

### Community 19 - "Community 19"
Cohesion: 0.38
Nodes (4): html5-qrcode, QRScannerPage(), ScannerClient(), ScannerClientProps

### Community 21 - "Community 21"
Cohesion: 0.33
Nodes (3): pg, match, { Client }

### Community 22 - "Community 22"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 23 - "Community 23"
Cohesion: 0.40
Nodes (3): CoordinatorItem, SubeventCoordinatorSelector(), SubeventCoordinatorSelectorProps

### Community 25 - "Community 25"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

## Knowledge Gaps
- **198 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+193 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 254 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Core UI Components` to `Student Events Dashboard`, `Event Admin Actions`, `Registration Core`, `Event Creation Forms`, `Date Utils`, `User Management`, `Package Metadata`, `Toast Component`, `Profile Settings`, `Community 17`, `Community 19`, `Community 23`?**
  _High betweenness centrality (0.242) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _198 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.06846635367762129 - nodes in this community are weakly interconnected._
- **Why does `@supabase/supabase-js` connect `Event Admin Actions` to `Core UI Components`, `Registration Core`, `Event Creation Forms`, `Date Utils`, `User Management`, `Package Metadata`, `Profile Settings`, `Database Audit Scripts`, `Registration Core Services`, `Community 20`, `Community 24`, `Community 27`, `Community 28`, `Community 29`, `Community 30`, `Community 31`, `Community 32`, `Community 33`, `Community 34`, `Community 35`, `Community 36`, `Community 37`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **Should `Student Events Dashboard` be split into smaller, more focused modules?**
  _Cohesion score 0.06956521739130435 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Student Events Dashboard` to `Core UI Components`, `Event Admin Actions`, `Registration Core`, `Event Creation Forms`, `Date Utils`, `User Management`, `Package Metadata`, `Profile Settings`, `Registration Core Services`, `Community 18`, `Community 26`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **Should `Event Admin Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.07111501316944688 - nodes in this community are weakly interconnected._