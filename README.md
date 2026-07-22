# The Daily Donna

A gentle daily check-in for Donna — mood, vitamins, appointments, pain, and creature sightings. Built for iOS Safari, shared with family (no login).

**Live site:** [https://belcho.github.io/the-daily-donna/](https://belcho.github.io/the-daily-donna/)

## Features

- Daily questionnaire with draft autosave
- Day resets at **5:00 AM US Eastern** (`America/New_York`)
- View today’s answers and browse **past days**
- Light purple, accessible UI (no flashing animations)

## One-time Supabase setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the script in [`supabase/migrations/001_checkins.sql`](supabase/migrations/001_checkins.sql).
3. Run [`supabase/migrations/002_add_note.sql`](supabase/migrations/002_add_note.sql) for optional daily notes.
4. Run [`supabase/migrations/003_photo_storage.sql`](supabase/migrations/003_photo_storage.sql) for photo uploads.
5. Run [`supabase/migrations/004_feedback.sql`](supabase/migrations/004_feedback.sql) for the bugs & ideas list.
6. Run [`supabase/migrations/005_bunny_count.sql`](supabase/migrations/005_bunny_count.sql) for bunny counts.
7. Run [`supabase/migrations/006_household_settings.sql`](supabase/migrations/006_household_settings.sql) for Donna’s private code.
8. Run [`supabase/migrations/007_good_stuff.sql`](supabase/migrations/007_good_stuff.sql) for the Good stuff photo gallery.
9. Run [`supabase/migrations/008_extras.sql`](supabase/migrations/008_extras.sql) for captions, encouragement jar, and related features.
10. Run [`supabase/migrations/009_shared_videos.sql`](supabase/migrations/009_shared_videos.sql) for the watch list (YouTube, TikTok, links).
11. Run [`supabase/migrations/010_grocery_and_meals.sql`](supabase/migrations/010_grocery_and_meals.sql) for grocery list and daily food mood.
12. In **Project Settings → API**, copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
13. Generate a random UUID (v4) for your household → `VITE_HOUSEHOLD_ID` (use the same value everywhere).

Row-level security expects the `x-household-id` header (set automatically by the app). If inserts fail with a permission error, confirm the migration ran and that your household UUID is valid.

## GitHub Actions secrets

In the repo **Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|--------|--------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_HOUSEHOLD_ID` | Your household UUID |

## Enable GitHub Pages

1. Repo **Settings → Pages**
2. **Build and deployment → Source:** GitHub Actions
3. Push to `master`; the **Deploy to GitHub Pages** workflow publishes `dist/`.

## Local development

```bash
cp .env.example .env
# Edit .env with your Supabase values
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173/the-daily-donna/`).

Optional: add `?debugDate=2026-07-21` to the URL to simulate a specific check-in day.

## Privacy note

Donna can set a **private code** on first open (any text she likes). The code is stored as a hash in Supabase so the same code works on a new phone; optional “remember on this phone” keeps it only in that device’s browser storage.

The shared site URL still includes the Supabase anon key, so treat the link as family-only. The code locks the app on her device and keeps the experience feeling like hers.
