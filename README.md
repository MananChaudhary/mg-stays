# MG Stays

AI-powered guest communication and hospitality platform for Airbnb and short-stay property hosts.

## Features

- **Premium landing page** — Marketing site with features, pricing, testimonials, and demo request
- **Clerk authentication** — Sign up, sign in, forgot password, role-based access
- **Host dashboard** — Overview stats, properties, bookings, messages, AI activity
- **Property management** — Full property details for AI context (WiFi, parking, rules, FAQs)
- **Guest stay pages** — `/stay/[bookingId]` — Digital concierge experience
- **AI guest assistant** — Claude-powered replies using property-specific context
- **Messaging inbox** — Review AI drafts, approve, edit, and send replies
- **Escalation system** — AI escalates urgent issues and notifies hosts

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- PostgreSQL + Prisma ORM
- Clerk Authentication
- Anthropic Claude API
- Framer Motion

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — From [clerk.com](https://clerk.com)
- `CLERK_SECRET_KEY`
- `ANTHROPIC_API_KEY` — From [console.anthropic.com](https://console.anthropic.com/settings/keys)

### 3. Set up database

```bash
npx prisma migrate dev --name init
npx prisma generate
npm run db:seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/dashboard/   # Protected host dashboard
│   ├── stay/[bookingId]/        # Public guest stay pages
│   ├── sign-in/ sign-up/        # Auth pages
│   └── api/                     # REST API routes
├── components/
│   ├── marketing/               # Landing page sections
│   ├── dashboard/               # Dashboard UI
│   ├── properties/              # Property forms
│   ├── messages/                # Inbox UI
│   └── guest/                   # Guest stay experience
├── lib/
│   ├── db.ts                    # Prisma client
│   ├── auth.ts                  # Clerk + DB user sync
│   └── ai.ts                    # Claude guest assistant
└── generated/prisma/            # Prisma client output
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/properties` | GET, POST | List/create properties |
| `/api/properties/[id]` | GET, PATCH, DELETE | Property CRUD |
| `/api/bookings` | GET, POST | List/create bookings |
| `/api/messages/[conversationId]` | POST | Send/approve messages |
| `/api/ai/chat` | POST | Guest AI chat (public) |
| `/api/contact` | POST | Demo request form |

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables from `.env.example`
4. Add PostgreSQL (Vercel Postgres, Neon, or Supabase)
5. Run `npx prisma migrate deploy` in build or post-deploy

## Demo Guest Page

After seeding, visit: `/stay/demo-booking-sarah`

## Future Roadmap

- Airbnb / Booking.com / Vrbo integrations
- WhatsApp messaging
- Automated message sequences
- Voice AI concierge
- Revenue analytics
- Team management

## License

Private — MG Stays
