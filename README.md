# Sai Systems — Official Website

🌐 **Live:** [saisystems.org.in](https://saisystems.org.in)

A modern, SEO-optimized, full-stack business website for Sai Systems — India's trusted refurbished IT products sales, laptop services, and CCTV installations.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel (free tier) |
| CI/CD | GitHub Actions → Vercel |
| Email | Resend.com |
| Domain | GoDaddy → Vercel DNS |

---

## 📋 Features

- ✅ **15+ Pages** — Home, Services (50+), Blog (10 articles), FAQ (50 questions), Products, Brands, About, Contact, Book Service, Admin
- ✅ **Dark/Light Mode** — System preference + manual toggle
- ✅ **WhatsApp Integration** — Floating button with predefined messages
- ✅ **Lead Generation Form** — With validation, DB save, and email notification
- ✅ **SEO Optimized** — Meta tags, Open Graph, Twitter Cards, JSON-LD schema, sitemap.xml, robots.txt
- ✅ **Mobile Responsive** — Works on all screen sizes
- ✅ **Admin Dashboard** — Lead management, service tracking, invoices
- ✅ **GitHub Actions CI/CD** — Auto-deploy to Vercel on every push

---

## ⚡ Quick Start (Development)

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/green-touch-solutions.git
cd green-touch-solutions

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual values

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔧 Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | supabase.com → Project Settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | supabase.com → Project Settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | supabase.com → Project Settings |
| `RESEND_API_KEY` | Email API key | resend.com (free) |
| `ADMIN_EMAIL` | Admin notification email | Your email |
| `NEXTAUTH_SECRET` | Auth secret | Run: `openssl rand -base64 32` |

---

## 🗄️ Database Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → **New Query**
3. Paste and run the contents of `supabase-platform-schema.sql`

---

## 🌐 Deployment (Free)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **New Project** → Import your GitHub repository
3. Add all environment variables from `.env.example`
4. Deploy!

### Step 3: Connect Custom Domain (GoDaddy)
1. In Vercel: Project → Settings → Domains → Add `saisystems.org.in`
2. Vercel will show you DNS records to add
3. In GoDaddy: DNS → Add the CNAME/A records shown by Vercel
4. HTTPS is automatic! ✅

### Step 4: Set Up GitHub Actions Secrets
In your GitHub repo → Settings → Secrets → Actions, add:
- `VERCEL_TOKEN` — from Vercel → Settings → Tokens
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📱 Contact Information to Update

Open `src/lib/config.ts` and update:
- `phone` — Your business phone number
- `whatsapp` — Your WhatsApp number (no spaces/dashes)
- `email` — Business email
- `address` — Complete address for local SEO

---

## 📁 Project Structure

```
sai-systems/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout (SEO, schema)
│   ├── sitemap.ts         # Dynamic sitemap
│   ├── about/             # About Us page
│   ├── services/          # Services listing + [slug] detail
│   ├── products/          # Products page
│   ├── brands/            # Brands page
│   ├── blog/              # Blog listing + [slug] article
│   ├── faq/               # FAQ page (50 questions)
│   ├── contact/           # Contact page
│   ├── book-service/      # Booking form
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
│       └── leads/         # Lead form API
├── src/
│   ├── components/
│   │   ├── layout/        # Header, Footer, WhatsApp button
│   │   └── home/          # All home page sections
│   └── lib/
│       ├── config.ts      # Site configuration
│       ├── supabase.ts    # Database client
│       └── data/          # All content data
│           ├── services.ts    # 38+ service definitions
│           ├── brands.ts      # 15 brand definitions
│           ├── testimonials.ts # 10 customer reviews
│           ├── faqs.ts        # 50 FAQs
│           └── blog-posts.ts  # 10 SEO articles
├── public/
│   ├── robots.txt
│   └── manifest.json
├── .github/workflows/
│   └── deploy.yml         # GitHub Actions CI/CD
├── supabase-platform-schema.sql # Database schema
└── .env.example           # Environment variables template
```

---

## 📞 Support

For technical support, contact the development team or raise an issue on GitHub.
