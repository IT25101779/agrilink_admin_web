# AgriLink AI 2.0 — Admin Command Center (Step 5)

## Design choices (quick note)
Deliberately different visual identity from the buyer portal — dark slate + indigo, versus the buyer portal's warm paper + forest green. This isn't decoration: it signals "you are in a different, higher-privilege system" the instant it loads, the way real admin panels (Stripe, AWS console) visually separate themselves from customer-facing product. Indigo is reserved specifically for the monetization (ads) features, forest green flags healthy/operational metrics, amber flags anything needing attention (outbreaks, paused ads, secondary-market share).

## What's in this step
- **Admin login/register** (self-registration is open for hackathon demo convenience — see the in-app note about why that'd be locked down in production)
- **Overview** — live platform metrics: farmers/buyers/drivers registered, active vs completed timelines, active disease outbreak clusters, gross marketplace value, listings by tier/status charts, recent transactions table
- **Marketplace Oversight** — every listing on the platform, filterable by tier and status, with rejection counts visible
- **Ad Scheduler** — create banner campaigns targeted by crop type, timeline phase, and district, with start/end dates, pause/resume, and impression/click tracking

## Setup

1. Backend must be running (`npm run dev` in `agrilink-backend`)
2. In this folder:
   ```bash
   npm install
   npm run dev
   ```
3. Open the printed URL (usually `http://localhost:5173` — if that's already taken by the buyer portal, Vite will automatically use `5174` instead; check your terminal output)

## Try it

1. Register an admin account
2. **Overview** tab should immediately show real counts pulled from whatever farmer/buyer/listing data you've already created testing the other two apps
3. **Marketplace Oversight** — see every listing across both tiers in one table
4. **Ad Scheduler** — click "Schedule New Ad", fill in a fake brand like "CIC Fertilizers", target crop type "tomato", target phase "pest_control", set any date range, submit — it should appear as a card immediately

## Note on the ad banner URLs
The form asks for a real image URL for the banner. For demo purposes, any public image URL works fine (e.g. right-click any product photo online → "Copy image address"). In production this would be a proper media upload to cloud storage.

## What's left (roadmap, not build)
Logistics/truck tracking and the crowdfunding engine remain as your Phase 2 roadmap slides — you now have a genuinely complete 3-app ecosystem (farmer mobile, buyer web, admin web) sharing one real backend, which is a strong, demoable submission on its own.

## UI Polish Pass (Step 11)
Same treatment as the buyer portal: Framer Motion for animated tab transitions, staggered metric-card and ad-card reveals, an animated sidebar indicator, and skeleton loading states. Lucide icons throughout (replacing emoji) for a more premium, consistent "command center" feel.

Run `npm install` after pulling this update — `framer-motion` and `lucide-react` are new dependencies.
