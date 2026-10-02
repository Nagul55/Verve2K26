Project Document · v1.0

# Verve26 – College Event Registration & Management Platform

A grand, modern and clean Townscript-style web app for registering, ticketing and managing every event of the college fest.

[Overview](#s1)[Team roles](#s2)[Tech stack](#s3)[Architecture](#s4)[Database](#s5)[Modules](#s6)[AI agents](#s7)[Timeline](#s8)[Risks](#s9)

## 01Overview

**Problem.** Fest registrations on paper or forms are slow, error-prone and impossible to track on the day.

**Solution.** One website where students browse the 8 events, register (solo or team), receive an e-mail with a QR ticket, and get scanned at the venue. Organisers manage everything from an admin portal.

#### Goals

- Premium, mobile-first event pages
- Registration in under 60 seconds
- Zero duplicate or fake entries
- Live attendance numbers

#### Users

- **Student:** browse, register, get ticket
- **Coordinator:** view own event's registrations, scan QR
- **Admin:** create events, export data, analytics

#### Constraints

- Free-tier services only
- Peak load around fest announcement
- Must work well on phones

## 02Team roles

Sized for a team of 4. In a smaller team, merge roles (e.g. 1 + 2, 3 + 4).

| Role | Owns | Key deliverables |
| --- | --- | --- |
| **Project Lead / Product Owner** | Scope, schedule, college coordination, testing sign-off | This document, event details content, demo, final presentation |
| **UI/UX & Frontend Developer** | Theme, components, all public pages | Home, events list, event details, registration form, ticket page |
| **Backend & Database Developer** | Schema, security rules, APIs, e-mail | Supabase tables and RLS, server actions, ticket e-mail, exports |
| **QA, Admin & DevOps** | Admin portal, scanner, deployment, monitoring | Admin dashboard, QR scanning page, Vercel deploy, Sentry, test plan |

## 03Tech stack (all free tier)

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js (App Router) + TypeScript | Fast pages, server actions, one codebase for front and back |
| Styling / UI | Tailwind CSS + shadcn/ui, Framer Motion | Clean, consistent design with subtle animation |
| Database & Auth | Supabase (Postgres, Auth, Storage, RLS) | Free tier, row-level security, poster storage |
| Validation | Zod (+ React Hook Form) | Same rules on client and server |
| Tickets | `qrcode` library, signed ticket ID | Unique, tamper-proof QR per registration |
| Scanning | `@yudiel/react-qr-scanner` | Scan from any phone browser, no app install |
| E-mail | Resend or Brevo free tier | Confirmation with embedded QR |
| Exports | `exceljs`, `papaparse` | Excel/CSV lists for coordinators |
| Hosting & monitoring | Vercel (Hobby), Sentry, GitHub | Free deploy previews and error tracking |

## 04Architecture & flow

**Student***→***Next.js UI***→***Server action + Zod***→***Supabase DB***→***E-mail with QR**

**Coordinator phone***→***/admin/scan***→***Verify ticket***→***Mark attended**

### Registration flow

1. Student opens an event and taps **Register**.
2. Form (details, team members) is validated with Zod.
3. Server checks seats left and duplicate (same e-mail + event), then inserts the registration in one transaction.
4. A unique ticket code is generated and encoded as a QR.
5. Confirmation e-mail is sent; the ticket is also available on a ticket page.
6. At the venue the coordinator scans; the ticket becomes `checked_in` and cannot be used twice.

## 05Database design

```
events(id, slug, title, category, description, rules, prizes,
       venue, starts_at, ends_at, fee, capacity, team_min, team_max,
       poster_url, is_published)

registrations(id, event_id → events, user_name, email, phone, college,
              dept, year, team_name, status, ticket_code UNIQUE,
              created_at)

team_members(id, registration_id → registrations, name, email, phone)

attendance(id, registration_id UNIQUE, scanned_by, scanned_at)

profiles(id → auth.users, role: 'admin' | 'coordinator', event_id?)
```

Rules: unique `(event_id, email)`; row-level security so students see only their ticket, coordinators only their event, admins everything.

## 06Modules & features

#### Public site

- Hero with countdown
- Event cards with filters and seats left
- Event details with sticky Register card
- Schedule, sponsors, contact

#### Registration & ticket

- Multi-step form
- Team support
- QR ticket page and e-mail
- Duplicate protection

#### Admin portal

- Create/edit events and posters
- Registrations table, search, export
- QR attendance scanner
- Live stats dashboard

### Design system

Dark gradient hero, light content area, one violet accent with an amber highlight, Sora headings, Inter body, rounded 2xl cards, soft shadows, scroll-fade animations, mobile-first layout.

## 07AI agents – how they should work

Two kinds of agents are useful: **build agents** that help the team write the code faster, and **runtime agents** (automations) that run inside the live app.

### A. Build agents (Claude Code / AI assistant roles)

Each agent has one job and a clear input and output. A human reviews every pull request.

| Agent | Input | Output | Rule |
| --- | --- | --- | --- |
| **Planner** | This document, a feature request | Task list with acceptance criteria | Never writes code |
| **UI agent** | Task + design tokens | Components and pages (Tailwind, shadcn) | Uses only theme tokens; mobile first |
| **Backend agent** | Task + schema | SQL migrations, RLS policies, server actions with Zod | Every table gets RLS; no secrets in code |
| **QA agent** | Finished feature | Test cases, edge-case checks, bug list | Tests duplicates, full events, expired or reused tickets |
| **Reviewer agent** | Pull request | Review comments on security, performance, style | Blocks merge on failing checks |

**Planner***→***UI + Backend (parallel)***→***QA***→***Reviewer***→***Human merge**

### B. Runtime agents (automations in the app)

#### Ticket agent

Trigger: new registration. Generates ticket code and QR, sends the e-mail, retries on failure and logs the result.

#### Check-in agent

Trigger: QR scan. Verifies signature, event match and status, marks attended once, shows a clear green/red result.

#### Reminder agent

Trigger: scheduled job. E-mails registered students the day before with venue and time, and notifies of schedule changes.

#### Report agent

Trigger: admin request. Builds the Excel/CSV of registrations and a summary of counts per event and department.

Guardrails: agents never delete data, all actions are logged, and any e-mail to students uses templates approved by the Project Lead.

## 08Timeline

| Phase | Work | Duration |
| --- | --- | --- |
| 1. Setup | Repo, Supabase, theme tokens, schema and RLS | Week 1 |
| 2. Public site | Home, events list, event details | Week 2 |
| 3. Registration | Form, tickets, e-mail | Week 3 |
| 4. Admin | Dashboard, scanner, exports | Week 4 |
| 5. Testing & launch | Load test, bug fixes, deploy, dry run | Week 5 |

## 09Risks & mitigation

| Risk | Mitigation |  |
| --- | --- | --- |
| Traffic spike when registration opens | Vercel edge caching for pages, small payloads, test with load tool beforehand |  |
| Free-tier limits (DB, e-mail) | Track usage, keep e-mails short, have a backup provider ready |  |
| Fake or shared tickets | Signed unique codes, single-use check-in |  |
| No internet at venue | Keep a downloadable attendee list per event as fallback |  |
| Student data privacy | Collect only needed fields, RLS, admin-only exports |  |

Verve26 · Project Document v1.0 · Edit roles, dates and event details to match your college.