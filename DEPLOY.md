# MG Stays — Live deployment (Vercel)

Production URL: **https://mg-mananchau786-2854s-projects.vercel.app** (or your custom domain after adding one in Vercel).

## Stack

| Service | Purpose |
|---------|---------|
| **Vercel** | Hosting (Next.js) |
| **Neon** | PostgreSQL (via Vercel integration) |
| **Clerk** | Auth (Google sign-in) |
| **Anthropic** | Guest AI chat |

## Owner login

Only `mananchau786@gmail.com` gets **Owner** access (`ADMIN_EMAILS` on Vercel).

## After deploy checklist

1. **Clerk** → [dashboard.clerk.com](https://dashboard.clerk.com) → add your Vercel URL to allowed domains.
2. Sign in on the live site with Google (owner email).
3. Add **real properties** (Properties → Add manually) — don’t rely on localhost seed data.
4. Create a **booking** → share `/stay/[bookingId]` with a guest phone.

## Redeploy

Push to GitHub `main` — Vercel auto-deploys if Git is connected.

Manual deploy:

```bash
npx vercel deploy --prod
```

## Environment variables (Vercel → Project → Settings → Environment Variables)

Required in **Production**:

- `DATABASE_URL` — from Neon (auto via integration)
- `ADMIN_EMAILS`
- `NEXT_PUBLIC_CLERK_*` + `CLERK_SECRET_KEY`
- `ANTHROPIC_API_KEY` + `ANTHROPIC_MODEL`
- `NEXT_PUBLIC_APP_URL` — your live Vercel URL

## Database migrations

```bash
source .env.local   # or use Vercel Neon env
npx prisma db push
```

## Demo vs live

- **Airbnb / Hostaway sync** — sample import only (not live API).
- **Cleaning team email** — in-app alert; outbound email needs Resend/SendGrid later.
