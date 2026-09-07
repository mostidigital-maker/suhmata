# Setting up a fresh, independent Supabase project

This project no longer depends on Lovable or any previously-provisioned
database. Follow these steps once, on a brand-new Supabase project you
control directly.

## 1. Create the project

Go to https://supabase.com, sign up/sign in with your own account (GitHub
sign-in works fine), and create a new project. Note the project's:
- **Project URL** (Settings → API → Project URL)
- **anon / publishable key** (Settings → API → Project API keys)

## 2. Run the schema

Open **SQL Editor** in the Supabase dashboard and run each file in this
folder **in order**, one at a time, waiting for each to finish before
running the next:

1. `00000000000001_init_roles_and_identity.sql`
2. `00000000000002_content_tables.sql`
3. `00000000000003_moderation_tables.sql`
4. `00000000000004_expansion_tables.sql`
5. `00000000000005_storage_admin_seed.sql`

This creates every table, RLS policy, storage bucket, and helper function
from scratch, plus a small amount of placeholder seed content.

## 3. Update the site's environment variables

Update `.env` (and wherever the same values are set in Vercel's project
settings — Vercel → your project → Settings → Environment Variables) with
the new project's URL and anon key:

```
SUPABASE_PROJECT_ID="..."
SUPABASE_PUBLISHABLE_KEY="..."
SUPABASE_URL="https://....supabase.co"
VITE_SUPABASE_PROJECT_ID="..."
VITE_SUPABASE_PUBLISHABLE_KEY="..."
VITE_SUPABASE_URL="https://....supabase.co"
```

## 4. Create your account and become the first super_admin

Sign up normally through the site's `/auth` page with the email/password
you want to use as the site owner. Then, back in the Supabase SQL Editor,
run:

```sql
insert into public.user_roles (user_id, role)
select id, 'super_admin' from auth.users where email = 'your-email@example.com';
```

That's the one manual bootstrap step — every role after this one (admin,
editor, or promoting/demoting anyone else, including yourself) can be
managed from the site's own admin panel under "Users & roles", since you
are now a super_admin.
