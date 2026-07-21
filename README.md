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
3. In **Project Settings → API**, copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
4. Generate a random UUID (v4) for your household → `VITE_HOUSEHOLD_ID` (use the same value everywhere).

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

There is no login. The shared link and API keys in the built site mean anyone with the link could read or change entries. Keep the URL within the family only.
