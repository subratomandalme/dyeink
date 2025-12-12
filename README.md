# DyeInk - Modern Blog Platform

A premium, high-performance blog platform built with React, TypeScript, and Supabase.

## Features

*   **Modern Design:** Glassmorphic UI, smooth animations (GSAP), and a premium feel.
*   **Secure & Anonymous Voting:** Fingerprint-based upvoting system ensuring fair engagement without login.
*   **Admin Dashboard:** Full CMS capabilities to create, edit, and manage posts.
*   **Email Subscription:** Integrated newsletter functionality.
*   **Performance:** Optimized for speed with Vite and responsive layouts.

## Tech Stack

*   **Frontend:** React, TypeScript, Vite
*   **Styling:** PostCSS, Custom CSS Variables, Animations
*   **Backend:** Supabase (Database, Auth, Realtime, RPC)
*   **Utilities:** Lucide React (Icons), date-fns, Recharts

## Setup & Deployment

### Local Development

1.  Clone the repository.
2.  Install dependencies: `npm install`.
3.  Set up environment variables in `.env`:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
4.  Run development server: `npm run dev`.

### Deployment (Vercel)

This project is optimized for deployment on Vercel.

1.  Import this repository into Vercel.
2.  Vercel will detect the `Vite` framework automatically.
3.  Add the Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the Vercel Project Settings.
4.  Deploy!

## License

MIT
