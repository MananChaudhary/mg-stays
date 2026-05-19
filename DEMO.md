# MG Stays — Demo walkthrough (start here)

Everything below works **without Clerk** (guest demo). Add Clerk later for the host dashboard.

## Already running?

- App: http://localhost:3000
- Database: `npx prisma dev` (separate terminal)

If the app is not running:

```bash
# Terminal 1
cd /Users/mananchaudhary/mg-stays && npx prisma dev

# Terminal 2
cd /Users/mananchaudhary/mg-stays && npm run dev
```

---

## Step 1 — Marketing site (2 min)

Open: **http://localhost:3000**

Scroll through: Features → AI section → Pricing → Testimonials.

---

## Step 2 — Guest stay demo (main demo)

Open: **http://localhost:3000/stay/demo-booking-sarah**

You should see:

- **The Loft · Downtown** (Melbourne)
- Check-in, WiFi, parking, house rules, checkout
- **AI Concierge** chat at the bottom

### Try these messages in the chat

1. `What's the WiFi password?`
2. `Where do I park?`
3. `What time is checkout?`

**With Claude key** (`ANTHROPIC_API_KEY` in `.env` + restart `npm run dev`): real AI answers from property data.

**Without Claude key**: generic fallback message (stay page info still works).

---

## Step 3 — Optional: Claude AI (recommended)

1. Add to `.env`:
   ```env
   ANTHROPIC_API_KEY=sk-ant-api03-...
   ```
2. Restart: `Ctrl+C` in dev terminal, then `npm run dev`
3. Retry the chat questions on the stay page

---

## Step 4 — Host dashboard (needs Clerk)

1. Free account: https://clerk.com → create app → copy API keys to `.env`
2. Restart `npm run dev`
3. http://localhost:3000 → **Start free trial** → sign up
4. **Properties** → Add property (your real client data)
5. **Bookings** → New booking → share new `/stay/[id]` link with guest

---

## Demo data reference

| Item | Value |
|------|--------|
| Property | The Loft · Downtown |
| WiFi | MG-Loft-Guest / StayComfortable2024 |
| Guest | Sarah Mitchell |
| Stay URL | `/stay/demo-booking-sarah` |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Stay page 404 | Run `npm run db:seed` (with `npx prisma dev` running) |
| Database error | Start `npx prisma dev` in Terminal 1 |
| AI generic replies | Add `ANTHROPIC_API_KEY` to `.env`, restart app |
| Can't sign in | Add Clerk keys to `.env` |
