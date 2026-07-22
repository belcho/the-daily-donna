# Database migrations

SQL files here are applied **in filename order** by the [Supabase CLI](https://supabase.com/docs/guides/cli).

## You should not paste these into the SQL Editor one-by-one anymore

### One-time: project already set up by hand?

If you already ran `001`–`010` in the dashboard, tell the CLI they are applied (run once from repo root):

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase migration repair --status applied 001
npx supabase migration repair --status applied 002
npx supabase migration repair --status applied 003
npx supabase migration repair --status applied 004
npx supabase migration repair --status applied 005
npx supabase migration repair --status applied 006
npx supabase migration repair --status applied 007
npx supabase migration repair --status applied 008
npx supabase migration repair --status applied 009
npx supabase migration repair --status applied 010
npx supabase migration repair --status applied 011
```

(`YOUR_PROJECT_REF` is the ID in your project URL: `https://supabase.com/dashboard/project/<ref>`.)

### Apply new migrations locally

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Or on Windows: `.\scripts\push-migrations.ps1`

### Automatic on git push

If GitHub secrets are set (see main README), pushing changes under `supabase/migrations/` runs the **Supabase migrations** workflow.
