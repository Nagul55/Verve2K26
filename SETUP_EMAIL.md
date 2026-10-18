# Verve26 Email & Password Recovery Setup Guide

This guide details the complete configuration required to connect custom SMTP (e.g. Resend, SendGrid, Amazon SES) with **Supabase Auth** for password recovery and 6-digit email OTP verification in Eventrix (Verve26).

---

## 1. Overview of the Recovery Flow

1. **User Request**: User enters their registered email on `/forgot-password`.
2. **Supabase Trigger**: The application invokes `supabase.auth.resetPasswordForEmail(email, { redirectTo })`.
3. **Email Dispatch**: Supabase sends a recovery email via your configured SMTP provider containing the 6-digit token (`{{ .Token }}`).
4. **Code Verification**: User enters the 6-digit code on `/forgot-password`. The app calls `supabase.auth.verifyOtp({ email, token, type: 'recovery' })`.
5. **Session Established**: Supabase validates the token and establishes an active recovery session.
6. **Password Update**: User submits a new password via `supabase.auth.updateUser({ password: newPassword })`.
7. **Session Invalidation**: Temporary recovery session is terminated so user logs in cleanly with the new password.

---

## 2. SMTP Provider Configuration (e.g., Resend)

Supabase Auth uses built-in rate-limited email delivery by default (approx. 3-4 emails/hour in free tier). For reliable production delivery, you **must configure Custom SMTP**.

### Resend Setup Steps:
1. Log in to [Resend Dashboard](https://resend.com).
2. Go to **Domains** > **Add Domain** (e.g., `eventrix.sonatech.ac.in` or your custom domain).
3. Add the required DNS records (`MX`, `TXT` for SPF/DKIM, and `DMARC`) to your domain registrar.
4. Verify the domain in Resend.
5. Go to **API Keys** > **Create API Key**:
   - Permission: *Sending access* (Full access or restricted to domain).
   - Save the generated key (starts with `re_...`). **Do not commit this key anywhere.**

*(Note for development/testing: If using Resend's free tier without a custom domain, you can test by sending emails to the email address registered with your Resend account using `onboarding@resend.dev` as the sender).*

---

## 3. Supabase Dashboard SMTP Settings

1. Open your **[Supabase Project Dashboard](https://supabase.com/dashboard)**.
2. Navigate to **Project Settings** (gear icon) > **Authentication**.
3. Scroll to **SMTP Settings** and toggle **Enable Custom SMTP** to **ON**.
4. Enter the following parameters:

| Field | Resend Value | Standard SMTP (e.g., SendGrid/AWS SES) |
|---|---|---|
| **Sender Email** | `noreply@yourdomain.com` (or `onboarding@resend.dev` for test) | Your verified sender email |
| **Sender Name** | `Eventrix Verve26` | `Eventrix Verve26` |
| **Host** | `smtp.resend.com` | e.g. `smtp.sendgrid.net` or `email-smtp.[region].amazonaws.com` |
| **Port** | `465` (SSL) or `587` (TLS) | `587` or `465` |
| **Minimum Interval** | `60` seconds | `60` seconds |
| **User** | `resend` | Your SMTP username / API key name |
| **Password** | Your Resend API Key (`re_...`) | Your SMTP API Password / Secret |

5. Click **Save Changes**.

---

## 4. Supabase Password Recovery Email Template

1. In Supabase Dashboard, go to **Authentication** > **Email Templates**.
2. Select **Reset Password**.
3. Configure the template fields:

### Subject:
```
Reset Your Eventrix Password - Verification Code
```

### Body (HTML):
```html
<h2>Reset Your Eventrix Password</h2>

<p>You requested to reset your password for Eventrix. Use the following 6-digit verification code:</p>

<div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 18px 24px; display: inline-block; margin: 16px 0;">
  <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #7c3aed; font-family: monospace;">
    {{ .Token }}
  </span>
</div>

<p style="color: #6b7280; font-size: 13px;">This code will expire in 10 minutes. If you did not request this, please disregard this email.</p>

<p style="color: #4b5563; font-size: 14px;">Alternatively, click the link below to reset your password directly:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #080B18; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">
    Reset Password Directly
  </a>
</p>
```

> **Crucial Template Variables:**
> - `{{ .Token }}`: Provides the 6-digit numeric OTP code entered on `/forgot-password`.
> - `{{ .ConfirmationURL }}`: Provides the fallback direct magic link.

---

## 5. URL Redirects Configuration

In Supabase Dashboard, go to **Authentication** > **URL Configuration**:

1. **Site URL**:
   - Development: `http://localhost:3000`
   - Production: `https://sona-eventrix-itads.vercel.app` (or your production domain)
2. **Redirect URLs**:
   Add the following patterns:
   - `http://localhost:3000/**`
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/reset-password`
   - `https://sona-eventrix-itads.vercel.app/**`
   - `https://sona-eventrix-itads.vercel.app/auth/callback`
   - `https://sona-eventrix-itads.vercel.app/reset-password`

---

## 6. Environment Variables

The frontend recovery flow uses only the public anonymous key. **Never expose SMTP secrets or the Supabase Service Role key in client files.**

In `.env.local` (local development) and Vercel Project Settings (production):

```ini
# Public Supabase credentials (Safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Server-side only (Admin operations / seed scripts)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

*Note: SMTP credentials are saved directly inside Supabase Dashboard settings, NOT in your Next.js application `.env` files.*

---

## 7. Developer Testing Procedure

1. **Local Test**:
   - Ensure `npm run dev` is running on `http://localhost:3000`.
   - Open `http://localhost:3000/forgot-password`.
   - Enter your email registered in Supabase Auth.
   - Click **Send Verification Code**.
2. **Check Inbox**:
   - Look for email from `Eventrix Verve26`.
   - Check spam/junk folder if not found within 1 minute.
3. **Verify OTP**:
   - Type or paste the 6-digit code into the OTP inputs on `/forgot-password`.
   - Click **Verify Code**.
4. **Update Password**:
   - Enter and confirm your new password (minimum 8 characters, number/special character).
   - Click **Update Password**.
   - Verify success screen and click **Go to Sign In**.
   - Log in with your newly set password on `/`.

---

## 8. Troubleshooting & Diagnostics

| Symptom / Error | Root Cause | Solution |
|---|---|---|
| `status: 429` / `over_email_send_rate_limit` | Supabase default rate limit reached (3-4/hr without custom SMTP) | Wait 60 seconds, or enable Custom SMTP in Supabase Dashboard to remove restrictive limits. |
| `Invalid, expired, or already used verification code` | Code expired (default 10-15 mins) or typed incorrectly | Request a fresh code by clicking **Resend Code** after 60s cooldown. |
| Email not arriving in inbox | SMTP authentication error, domain DNS unverified, or spam filter | 1. Check Supabase Dashboard > Logs > Auth Logs for delivery errors.<br>2. Check Resend Dashboard > Logs for rejected/bounced events.<br>3. Verify SPF and DKIM DNS records. |
| Redirect lands on `/admin` instead of `/reset-password` | Auth callback lacked explicit password reset override | Fixed in `src/app/auth/callback/route.ts` line 107 (prioritizes `/reset-password`). |
| `Recovery Session Required` on `/reset-password` | Direct navigation without verifying an OTP first | Intended security guard. User must verify OTP or click magic link before accessing reset page. |
| Maximum verification attempts exceeded | User failed code entry 5 times | Security brute-force lock. User must click "Change email" or "Resend Code" to restart verification. |

---

## 9. Status of Configured Items

- [x] **Frontend Flow & Security Guards**: Implemented and verified on `/forgot-password` and `/reset-password`.
- [x] **Auth Callback Routing**: Configured to route recovery redirects directly to `/reset-password`.
- [x] **Unit & E2E Test Coverage**: Automated test suites covering OTP parsing, input auto-advance, rate limits, and session protection.
- [ ] **Custom SMTP Credentials in Supabase**: *Must be configured manually by administrator in Supabase Dashboard (Steps 2–4).*
