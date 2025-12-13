---
description: Configure Supabase Auth Redirects for Production
---

# Configure Supabase for Production

When you deploy your app (e.g. to Vercel, Netlify, or a custom domain), you must update Supabase to allow redirects to that new domain. If you don't, users will be redirected to `localhost` or see "Access Denied" errors.

## Step 1: Open Supabase Dashboard
1. Go to [database.new](https://supabase.com/dashboard) and log in.
2. Select your project.

## Step 2: Go to URL Configuration
1. In the sidebar, click on the **Authentication** icon (looks like a users group).
2. In the Authentication menu, click **URL Configuration**.

## Step 3: Update Site URL
The "Site URL" is the default URL users are redirected to if no other URL is specified.
1. Find the **Site URL** field.
2. Change it from `http://localhost:5173` (or 3000) to your **Production URL**.
   * Example: `https://dyeink.vercel.app`

## Step 4: Add Redirect URLs
The "Redirect URLs" allow specific sub-paths or wildcard domains.
1. Scroll down to **Redirect URLs**.
2. Click **Add URL**.
3. Add your production URL with a wildcard at the end:
   * Format: `https://your-domain.com/**`
   * Example: `https://dyeink.vercel.app/**`
   * The `/**` is crucial. It allows Supabase to redirect to pages like `/reset-password` or `/admin/settings`.
4. (Optional) Keep `http://localhost:5173/**` if you still want to test locally.

## Step 5: Save
1. Click **Save** at the bottom/top of the section.

## Verification
1. Open your production site.
2. Go to Login -> Forgot Password.
3. Enter your email.
4. Click the link in the email.
5. It should now open your **Production Site** and correctly redirect you to the Settings page.
