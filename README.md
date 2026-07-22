# The Daily Donna

A gentle daily check-in for Donna — mood, vitamins, appointments, pain, and creature sightings. Built for iOS Safari, shared with family (no login).

**Live site:** [https://belcho.github.io/the-daily-donna/](https://belcho.github.io/the-daily-donna/)

## Features

- Daily questionnaire with draft autosave
- Day resets at **5:00 AM US Eastern** (`America/New_York`)
- View today’s answers and browse **past days**
- Light purple, accessible UI (no flashing animations)

## Database (migrations)

Schema lives in [`supabase/migrations/`](supabase/migrations/). **Do not** run each file in the SQL Editor every time — use one of these:

### Option A — Automatic (recommended)

1. In [Supabase Account → Access Tokens](https://supabase.com/dashboard/account/tokens), create a token.
2. In Supabase **Project Settings → Database**, copy the **database password** (reset if you do not have it).
3. Copy **Project ID** from **Project Settings → General** (same as the ref in your project URL).
4. Add GitHub Actions secrets (repo **Settings → Secrets**):

| Secret | Value |
|--------|--------|
| `SUPABASE_ACCESS_TOKEN` | Personal access token from step 1 |
| `SUPABASE_DB_PASSWORD` | Database password |
| `SUPABASE_PROJECT_ID` | Project ref / ID |

When you push to `master` and migration files change, the [**Supabase migrations**](.github/workflows/supabase-migrations.yml) workflow runs `supabase db push` for you.

### Option B — From your PC

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_ID
npx supabase db push
```

Windows shortcut: `.\scripts\push-migrations.ps1` (after link).

### Brand-new Supabase project

Run once: `npx supabase link` then `npx supabase db push` — applies **all** migrations in order.

### Already ran SQL by hand?

One-time baseline so the CLI does not try to re-run old scripts — see [`supabase/migrations/README.md`](supabase/migrations/README.md) (`migration repair`).

## One-time app config (API keys)

1. Create a free project at [supabase.com](https://supabase.com) (or use your existing one).
2. Apply migrations (section above).
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

Optional (auto database migrations on push):

| Secret | Value |
|--------|--------|
| `SUPABASE_ACCESS_TOKEN` | [Supabase access token](https://supabase.com/dashboard/account/tokens) |
| `SUPABASE_DB_PASSWORD` | Project database password |
| `SUPABASE_PROJECT_ID` | Project ref (Settings → General) |

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
