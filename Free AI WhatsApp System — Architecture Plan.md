# Free AI WhatsApp System — Architecture Plan

## Free Stack (Zero Cost)

| Component | Tool | Cost | Why |
|---|---|---|---|
| Customer channel | WhatsApp Cloud API | **FREE** (service conversations free since Nov 2024) | Customers message your WA number |
| AI brain | Flowise (self-hosted) | **FREE** (open-source) | Drag-drop AI flows, no coding |
| Hosting Flowise | Render.com free tier | **FREE** | 512MB RAM, sleeps when idle |
| Database | Supabase (existing) | **FREE** | Chat history storage |
| Human handoff | Agent's WhatsApp mobile | **FREE** | History sent to +91 94871 79676 |

---

## How It Works

```
Customer sends WhatsApp message
         ↓
POST /api/webhooks/whatsapp  (your Next.js server)
         ↓
POST to Flowise prediction API  (self-hosted, free)
  - Flowise uses Gemini/Groq/Ollama (free tier)
  - Flowise has memory = knows full chat history
         ↓
Flowise responds: { text, intent }
  • intent = "continue" → reply to customer on WhatsApp
  • intent = "handoff"  → send chat history to agent's WhatsApp
         ↓
Customer gets response on WhatsApp
         ↓
If handoff:
  → Agent gets on +91 94871 79676:
    "📲 CUSTOMER REQUEST
     Name: Ravi | Phone: +91 9876543210
     — CHAT HISTORY —
     Customer: My Dell laptop screen is cracked
     AI: What model?
     Customer: Inspiron 15
     → Reply to this customer on WhatsApp: wa.me/919876543210"
  → Agent opens the link, continues on their phone
```

## What Will Be Built

### 1. WhatsApp Inbound Webhook
`app/api/webhooks/whatsapp/route.ts`
- GET: Meta webhook verification (token handshake)
- POST: Receives customer messages, routes to Flowise, sends response back
- Stores conversation in Supabase `wa_conversations` table

### 2. Flowise Client
`src/lib/flowise.ts`
- Calls Flowise prediction API: `POST {FLOWISE_URL}/api/v1/prediction/{CHATFLOW_ID}`
- Passes `sessionId` = customer phone (Flowise maintains memory per session)
- Returns `{ text, intent }`

### 3. Human Handoff Formatter
When Flowise returns `intent: "handoff"`:
- Fetches full chat history from Supabase
- Formats as WhatsApp-readable message
- Sends to +91 94871 79676 with customer's WA link to continue

### 4. Supabase Table
`wa_conversations` — stores each message (from/to, content, timestamp, session)

### 5. Platform Dashboard update
`/platform/whatsapp` — shows live WhatsApp conversation threads, not just handoff queue

---

## Free Flowise Setup (15 mins)

1. Go to [render.com](https://render.com) → Deploy from GitHub
2. Use Flowise Docker image: `flowiseai/flowise`
3. Get a free HTTPS URL: `https://your-app.onrender.com`
4. In Flowise: create a chatflow with:
   - **WhatsApp Trigger** style: just use BufferMemory + ChatGroq (Groq is FREE)
   - OR use Gemini (you already have the key)
5. Copy the `Chatflow ID` from Flowise

## Free AI Models (no API cost)

| Model | Where | Free? |
|---|---|---|
| Gemini 1.5 Flash | Google AI Studio | ✅ 1M tokens/day free |
| Groq (Llama 3.3) | groq.com | ✅ 30 req/min free |
| Ollama | Self-hosted | ✅ Fully free (local) |

---

## What Changes in Your Codebase

**New files:**
- `app/api/webhooks/whatsapp/route.ts` — inbound WA webhook
- `src/lib/flowise.ts` — Flowise API client
- `app/api/webhooks/whatsapp/verify/route.ts` — Meta token verification

**Modified:**
- `app/platform/whatsapp/page.tsx` — show WA conversation threads
- `.env.example` — Flowise URL + Chatflow ID

**Removed (were paid/complex):**
- Vapi webhook (not needed — WA replaces voice for now)
- The triage engine (Flowise handles all AI logic)
