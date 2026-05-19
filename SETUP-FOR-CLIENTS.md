# MG Stays — Setup for You & Your Clients

## AI: Claude (Anthropic), not OpenAI

MG Stays uses your **Claude API key** for the guest chatbot. You do **not** need OpenAI.

| Variable | Where to get it |
|----------|-----------------|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| `ANTHROPIC_MODEL` | Optional — default `claude-sonnet-4-20250514`; use `claude-3-5-haiku-latest` for lower cost at scale |

---

## What you need to start the test demo

| # | Service | Required? | What it does |
|---|---------|-----------|--------------|
| 1 | **PostgreSQL** | Yes | Stores all 20 properties, WiFi, bookings, messages |
| 2 | **Clerk** | Yes (for dashboard) | You + clients sign in to manage properties |
| 3 | **Claude API** | Yes (for smart AI chat) | Guest chatbot on each stay page |

### Terminal 1 — database (keep running)

```bash
cd /Users/mananchaudhary/mg-stays
npx prisma dev
```

### Terminal 2 — app

```bash
cd /Users/mananchaudhary/mg-stays
npm run dev
```

### Your `.env` minimum for full demo

```env
DATABASE_URL="postgres://postgres:postgres@localhost:51214/template1?sslmode=disable"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-sonnet-4-20250514

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Demo without signing in (guest page only)

Already seeded — open: **http://localhost:3000/stay/demo-booking-sarah**

(Add `ANTHROPIC_API_KEY` and restart `npm run dev` for real Claude replies.)

---

## 20 properties — will it work?

**Yes.** Each property is stored separately with its own:

- WiFi name & password  
- Check-in / checkout instructions  
- Parking, house rules, building access  
- FAQs and local tips  

When a guest opens **their** stay link (`/stay/[booking-id]`), Claude only sees **that one property’s** details — not your other 19. So guests at Property A never get Property B’s WiFi.

| Feature | Status |
|---------|--------|
| 20+ properties in dashboard | Supported |
| Per-property WiFi, rules, instructions | Supported — add each in **Properties** |
| AI chatbot per stay (Claude) | Supported — uses that property’s data |
| Guest stay page (self-serve info) | Supported |
| Host inbox + approve AI replies | Supported |
| Escalate to host when AI is unsure | Supported |
| **Scheduled** auto-messages (e.g. “check-in tomorrow”) | Not built yet — roadmap |
| Airbnb / WhatsApp sync | Not built yet — architecture ready |

### Typical flow for 20 client properties

1. Sign in → **Properties** → add all 20 (or import one-by-one).  
2. For each guest stay → **Bookings** → create booking → share `/stay/[id]`.  
3. Guest uses stay page + AI for WiFi, parking, check-in — no need to message you.  
4. You monitor **Guest Messages** and **AI Assistant** for escalations.

**Cost tip:** With ~20 active properties and many guest chats, set  
`ANTHROPIC_MODEL=claude-3-5-haiku-latest` in `.env` for lower API cost while keeping good answers.

---

## What you should NOT send to anyone

- Do not email or chat your API keys.  
- Only paste `ANTHROPIC_API_KEY` and Clerk keys into your own `.env` or Vercel dashboard.

---

## Quick checklist

- [ ] `npx prisma dev` running  
- [ ] `ANTHROPIC_API_KEY` in `.env`  
- [ ] Clerk keys in `.env`  
- [ ] `npm run dev`  
- [ ] Test guest page: `/stay/demo-booking-sarah`  
- [ ] Sign up → add a real property → create booking → test AI with “What’s the WiFi?”
