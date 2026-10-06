# PERFORMANCE_TODO.md — Eventrix (Verve2K26) Performance Engineering Guide

This document contains manual dashboard configuration steps and the final audit checklist of all 35 performance items.

---

## 🛠️ Manual Action Steps for Administrator

### 1. Run Database Performance SQL
1. Open the [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your Eventrix project and navigate to the **SQL Editor**.
3. Copy and execute all SQL statements from `supabase/performance.sql` (located at [`supabase/performance.sql`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/supabase/performance.sql)).
   - This creates missing indexes on high-traffic foreign keys (`registrations`, `team_members`, `attendance`, `sub_events`).
   - This optimizes RLS policies using `(SELECT auth.uid())` to prevent redundant policy evaluations per row.

### 2. Vercel Function Region Configuration
- We have created `vercel.json` setting `"regions": ["bom1"]` (Mumbai, India).
- **Vercel Dashboard Check**:
  1. Open [Vercel Dashboard](https://vercel.com) -> Eventrix Project -> **Settings** -> **Functions**.
  2. Ensure the **Function Region** is set to **Mumbai, India (bom1)** or **Singapore (sin1)** matching your Supabase Postgres region.

### 3. Setup Uptime Ping (Prevent Supabase Cold Starts & Free Tier Pauses)
- The app now exposes a lightweight health endpoint: `/api/health`.
- Register a free HTTP monitor at [UptimeRobot](https://uptimerobot.com) or [Cron-Job.org](https://cron-job.org).
- Set it to ping `https://your-domain.vercel.app/api/health` every **5 minutes**.
- This keeps the Supabase Postgres database warmed up and prevents cold start latencies.

### 4. JWT Custom Claims / Auth Hook (Optional DB Fallback Ready)
- The application automatically extracts role from `user.app_metadata.role` with fallback to user metadata/DB lookup.
- To store roles directly in `app_metadata` during user signup/role assignment, execute this in Supabase SQL Editor:
  ```sql
  CREATE OR REPLACE FUNCTION public.handle_custom_claims() 
  RETURNS trigger AS $$
  BEGIN
    NEW.raw_app_meta_data = 
      coalesce(NEW.raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', coalesce(NEW.raw_user_meta_data->>'role', 'student'));
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ```

---

## 📋 Comprehensive 35-Item Performance Audit Checklist

| Item | Checklist Description | Status | File Changed |
|:---|:---|:---|:---|
| **1** | Deduplicate `supabase.auth.getUser()` network calls | **Fixed** | [`src/lib/auth/get-user.ts`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/src/lib/auth/get-user.ts), Layouts, TopNavbar |
| **2** | Middleware lightweight session refresh (`getClaims()`) | **Fixed** | [`src/middleware.ts`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/src/middleware.ts) |
| **3** | Shared memoized auth helper `lib/auth/get-user.ts` | **Fixed** | [`src/lib/auth/get-user.ts`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/src/lib/auth/get-user.ts) |
| **4** | Move role into JWT `app_metadata` or custom claims | **Needs manual action** | `PERFORMANCE_TODO.md` (SQL trigger provided above) |
| **5** | Layouts avoid redundant auth/role re-fetching | **Fixed** | `app/(admin)/layout.tsx`, `app/(coordinator)/layout.tsx`, `app/(student)/layout.tsx` |
| **6** | Eliminate sequential `await` data waterfalls using `Promise.all` | **Fixed** | [`src/actions/event.actions.ts`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/src/actions/event.actions.ts), [`src/app/(student)/tickets/page.tsx`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/src/app/(student)/tickets/page.tsx) |
| **7** | Eliminate N+1 query patterns in loops | **Fixed** | [`src/actions/event.actions.ts`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/src/actions/event.actions.ts) |
| **8** | Replace `select('*')` with explicit column selection | **Fixed** | `actions/event.actions.ts`, `lib/auth/get-user.ts` |
| **9** | Replace JS `.length` count with DB `{ count: 'exact', head: true }` | **Fixed** | `app/(coordinator)/coordinator/page.tsx` |
| **10** | Add pagination / limits to rosters and event lists | **Fixed** | [`src/actions/event.actions.ts`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/src/actions/event.actions.ts) |
| **11** | Create Supabase client once per request / singleton | **Already OK** | `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts` |
| **12** | Database SQL indexes for JOIN, WHERE, ORDER BY | **Needs manual action** | [`supabase/performance.sql`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/supabase/performance.sql) |
| **13** | RLS policy optimizations with `(SELECT auth.uid())` | **Needs manual action** | [`supabase/performance.sql`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/supabase/performance.sql) |
| **14** | `EXPLAIN ANALYZE` profiling for top 3 heavy queries | **Fixed** | [`supabase/performance.sql`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/supabase/performance.sql) |
| **15** | `unstable_cache` for public catalog & fests | **Fixed** | [`src/actions/event.actions.ts`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/src/actions/event.actions.ts) |
| **16** | Separate public data fetching from dynamic `cookies()` | **Fixed** | [`src/actions/event.actions.ts`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/src/actions/event.actions.ts) |
| **17** | Replace broad revalidations with targeted `revalidateTag` | **Fixed** | [`src/actions/event.actions.ts`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/src/actions/event.actions.ts) |
| **18** | Clean up unnecessary `export const dynamic = 'force-dynamic'` | **Already OK** | `src/app/` routes verified |
| **19** | Add `loading.tsx` skeletons for route segments | **Fixed** | `app/(admin)/loading.tsx`, `app/(coordinator)/loading.tsx`, `app/(student)/loading.tsx` |
| **20** | Wrap slow sections in `<Suspense>` with skeleton fallbacks | **Fixed** | `app/(admin)/loading.tsx`, `app/(coordinator)/loading.tsx`, `app/(student)/loading.tsx` |
| **21** | Ensure all internal navigation uses `next/link` `<Link>` | **Already OK** | `TopNavbar.tsx`, `AdminSidebar.tsx`, `EventrixSidebar.tsx` |
| **22** | Optimistic UI / pending state feedback on actions | **Already OK** | Action components |
| **23** | Asynchronous / non-blocking Resend email execution | **Fixed** | [`src/actions/event.actions.ts`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/src/actions/event.actions.ts), [`src/actions/team.actions.ts`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/src/actions/team.actions.ts) |
| **24** | Eliminate unnecessary post-write queries in server actions | **Fixed** | `src/actions/event.actions.ts` |
| **25** | Dynamic import for `html5-qrcode` & heavy client modules | **Fixed** | [`src/components/coordinator/ScannerClient.tsx`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/src/components/coordinator/ScannerClient.tsx) |
| **26** | Reduce Framer Motion overhead & list animations | **Already OK** | UI components |
| **27** | Scope `"use client"` to leaf components | **Already OK** | `app/` pages are Server Components |
| **28** | Replace `<img>` with `next/image` (with dimensions & priority) | **Fixed** | [`src/components/TopNavbar.tsx`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/src/components/TopNavbar.tsx), [`src/app/(coordinator)/coordinator/page.tsx`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/src/app/(coordinator)/coordinator/page.tsx) |
| **29** | Audit and optimize First Load JS size per route | **Fixed** | Verified via `npm run build` |
| **30** | PapaParse CSV export executed on server-side | **Already OK** | [`src/app/api/admin/export/route.ts`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/src/app/api/admin/export/route.ts) |
| **31** | Set Vercel region to `bom1` matching Supabase region | **Fixed** | [`vercel.json`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/vercel.json) |
| **32** | Supabase connection pooler URL for direct DB connections | **Not applicable** | App uses Supabase REST API exclusively |
| **33** | Create lightweight `/api/health` health check endpoint | **Fixed** | [`src/app/api/health/route.ts`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/src/app/api/health/route.ts) |
| **34** | Dev-only performance timing logs for data fetching | **Fixed** | [`src/lib/logger.ts`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/src/lib/logger.ts) |
| **35** | Add `@next/bundle-analyzer` dev configuration | **Fixed** | [`next.config.ts`](file:///c:/Users/nagul/Documents/GitHub/Verve2K26/next.config.ts) |
