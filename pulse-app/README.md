# 🩷 Pulse by StudyFocus Hub

> Know your brain. Study smarter.

## ⚡ Setup (10 minutes)

### 1. Clone and install
```bash
git clone https://github.com/yourusername/pulse-app
cd pulse-app
npm install
```

### 2. Set up environment variables
Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

- `DATABASE_URL` — from Vercel Neon dashboard (Storage → your DB → connection string)
- `JWT_SECRET` — run `openssl rand -base64 32` and paste the output
- `OPENROUTER_API_KEY` — from openrouter.ai → API Keys
- `GUMROAD_API_KEY` — from gumroad.com → Settings → Advanced → Access Token
- `NEXT_PUBLIC_APP_URL` — your Vercel URL

### 3. Set up database
```bash
npm run db:push
```

### 4. Generate API routes
```bash
node scripts/generate-routes.js
```

### 5. Run locally
```bash
npm run dev
```

Open http://localhost:3000

---

## 🚀 Deploy to Vercel

1. Push to GitHub
2. Go to vercel.com → Import project
3. Add all environment variables in Vercel dashboard
4. Deploy!

Every push to main auto-deploys. Done.

---

## 📁 Structure

```
pulse-app/
├── app/
│   ├── page.tsx              ← landing page
│   ├── activate/             ← license key entry
│   ├── login/                ← login
│   ├── onboarding/           ← DNA quiz
│   ├── dashboard/            ← main dashboard
│   ├── log/                  ← session logger
│   ├── insights/             ← brain insights
│   ├── coach/                ← AI coach chat
│   ├── forget/               ← forget tracker
│   ├── locked/               ← subscription lapsed
│   └── api/                  ← all API routes
├── components/
│   ├── Cursor.tsx            ← custom cursor
│   └── BeatingHeart.tsx      ← liquid heart
├── lib/
│   ├── schema.ts             ← database schema
│   ├── db.ts                 ← neon connection
│   ├── auth.ts               ← JWT auth
│   ├── gumroad.ts            ← license key validation
│   └── ai.ts                 ← OpenRouter AI
└── scripts/
    └── generate-routes.js    ← creates all API files
```

---

## 💰 Pricing

Set up in Gumroad:
- **Pulse Monthly** — $10.99/mo (enable license keys)
- **Pulse Lifetime** — $34 one-time (enable license keys)
- Affiliates: 40-50% commission in Gumroad settings

---

## 🔑 How license keys work

1. User buys on Gumroad → gets key via email
2. Goes to `/activate` → enters key
3. App calls Gumroad API to verify
4. Monthly: checked on every login
5. Cancelled subscription → redirected to `/locked`
6. Lifetime: verified once, never expires
