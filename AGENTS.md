# AGENTS.md - ParableForge

This document provides context for AI assistants working on this codebase.

## Project Overview

## 1. THE VISION (THE PRIME DIRECTIVE)
We are building **"Sovereign Infrastructure"** for the Creator Economy.
* **The Problem:** "Subscription Serfdom" (renting business tools from Kajabi/ClickFunnels).
* **The Solution:** A "Zero-Opex" tech stack that costs $0/mo to run and is 100% owned by the user.
* **The Brand:** "StackForge." We are the "Anti-Guru." We do not sell courses; we sell the **Code** (The Arsenal) and the **Implementation** (The Launchpad).

**ParableForge** is a screen-free family adventure platform for children ages 4-12. Parents become "adventure guides" using narrative scripts from "The Grimoire" (a protected documentation portal).
* **Strategic Role:** This is the "Proof of Concept." We are building this not just to sell the game, but to productize the underlying code into the **"Sovereign Starter Kit"** (The Arsenal).

- **Live Site:** https://playparableforge.com
- **Target Audience:** Parents ("Guardians") seeking screen-free activities

## 2. Tech Stack
We use the **"Zero-Opex"** stack. Do not suggest AWS, Docker, or paid SaaS unless explicitly authorized.
| Layer | Technology | Version | Constraint |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Astro** | v5.6.x | Static-First. No React SPAs unless necessary. |
| **Docs/LMS** | **Starlight** | v0.37.x | Used for "The Grimoire" (Adventure Portal). |
| **Styling** | **Tailwind CSS** | v3.4.x | Mobile-first. No generic CSS files. |
| **Auth** | **Supabase** | v2.49.x | Client-side auth via `localStorage`. |
| **CMS** | **Decap CMS** | External | Headless CMS with admin interface. |
| **Payments** | **Lemon Squeezy** | Placeholder | Handles tax/VAT for digital products. |
| **Icons** | **Lucide React** | v0.562.x | Consistent, clean SVG icons. |
| **Hosting** | **GitHub Pages** | - | Must remain static/free. |

## 3. Architecture

We are building a **Product**, not just a website. The code must be reusable.
1.  **Decouple Content:** Never hard-code text. All content must live in `src/content/` (Markdown) or Supabase.
    * *Goal:* We must be able to strip the "Parable Forge" stories out and sell the "Engine" as a blank template.
2.  **State Management:** Use **Nano Stores** for lightweight state (cart, user session). Avoid complex Redux/Context providers.
3.  **Secrets:** NEVER hard-code keys. Use `import.meta.env.PUBLIC_...` for frontend and `process.env...` for backend functions.

---

## 4. CODING STANDARDS (THE ANTI-AI AESTHETIC)
* **Design:** Professional, "SaaS-grade" UI.
    * **Banned:** Emojis in UI (🚀, ✨), "Lorem Ipsum," generic gradients.
    * **Required:** Lucide Icons, Inter/Geist font, generous whitespace.
* **Mobile First:** All layouts must work on iPhone SE.
    * *Special Rule:* Starlight documentation pages must act as a "Teleprompter" on mobile (hidden sidebars, large text).
* **Comments:** Write comments for **Junior Developers**. Explain *why*, not just *what*. (These comments become the "Manual" for our buyers).

```
src/
├── components/           # Reusable components
│   ├── AuthGuard.astro   # Protects content requiring auth
│   ├── HealthTracker.tsx # React component for adventure HP
│   └── starlight/        # Starlight overrides
│       ├── Head.astro    # Injects auth check on grimoire pages
│       └── Header.astro  # Adds health tracker to header
├── content/
│   └── docs/grimoire/    # Adventure content (MDX)
│       ├── welcome.mdx
│       └── adventures/   # Individual adventure scripts
├── layouts/
│   └── BaseLayout.astro  # Main page wrapper
├── lib/
│   └── supabase.ts       # Auth client & helpers
├── pages/                # Route-based pages
│   ├── index.astro       # Landing page
│   ├── login.astro       # Authentication
│   ├── setup-grimoire.astro  # Post-purchase onboarding
│   ├── admin/             # Decap CMS interface (static files)
│   ├── privacy.astro     # Legal
│   └── terms.astro       # Legal
└── styles/
    └── global.css        # Theme, animations, utilities
```

### Key Configuration Files

| File | Purpose |
|------|---------|
| `astro.config.mjs` | Astro + Starlight + integrations setup |
| `tailwind.config.mjs` | Theme colors, custom animations |
| `public/admin/config.yml` | Decap CMS configuration for adventures & resources |
| `.github/workflows/deploy.yml` | GitHub Pages deployment |
| `public/CNAME` | Custom domain config |

## Authentication Flow

1. **Public Access:** Landing page, login, legal pages
2. **Purchase:** External LemonSqueezy checkout
3. **Account Creation:** `setup-grimoire.astro` → `signUp()`
4. **Login:** `login.astro` → `signIn()`
5. **Protected Content:** `/grimoire/*` routes checked by `Head.astro`

### Auth Implementation Details

- **Supabase Client:** `src/lib/supabase.ts`
- **Session Storage:** `sb-fhihhvyfluopxcuezqhi-auth-token` in localStorage
- **Dev Bypass:** localhost/127.0.0.1 skips auth checks
- **Redirect Logic:** Unauthenticated users → `/login?redirect=<path>`

### Auth Functions Available

```typescript
import { signUp, signIn, signOut, getUser, getSession } from '../lib/supabase';
```

## Content Management

### Adventure Content
- **Location:** `src/content/docs/grimoire/adventures/`
- **Format:** MDX (Markdown + JSX)
- **Front Matter:** title, description, sidebar.label, sidebar.order

### Decap CMS
- **Admin Route:** `/admin` (served from `public/admin/`)
- **Config:** `public/admin/config.yml`
- **Media:** `public/images/`
- **Setup:** Ready for Netlify Identity, currently serves static interface

### GitHub-Based Content Management
- **Current Method:** Direct GitHub file editing and PR workflow
- **Content Location:** `src/content/docs/grimoire/`
- **Edit Process:** GitHub web interface → Pull request → GitHub Actions deploy
- **Benefits:** Zero additional services, integrates with existing workflow
- **Future Option:** Can migrate to Netlify + Decap CMS for enhanced editing experience

### Adding New Adventures
1. Create `.mdx` file in `src/content/docs/grimoire/adventures/`
2. Include required front matter
3. Starlight auto-generates navigation

## Styling

### Theme Colors (Forge Dark)

```css
--forge-dark: #0B0F19;     /* Background */
--forge-card: #111827;     /* Card backgrounds */
--forge-blue: #3B82F6;     /* Primary accent */
--forge-purple: #8B5CF6;   /* Secondary */
--forge-gold: #F59E0B;     /* Highlight */
--forge-red: #EF4444;      /* Error/danger */
```

### Key CSS Classes
- `.glass-panel` - Glass morphism effect with backdrop blur
- `.animate-forge-flow` - Animated text gradient
- `.twinkle` - Star field animation
- `.white-hot-pulse` - Shockwave finale effect

### Tailwind Extensions
Custom animations defined in `tailwind.config.mjs`:
- `forge-flow`, `twinkle`, `white-hot-pulse`, `fade-in`, `hero-glow`

## Interactive Components

### Health Tracker
Two implementations exist:

1. **React Version** (`src/components/HealthTracker.tsx`)
   - Standalone React component
   - Uses useState hooks
   - Lucide icons

2. **Vanilla JS Version** (in `src/components/starlight/Header.astro`)
   - Injected into Starlight header on adventure pages
   - Avoids React hydration overhead
   - Positioned next to Ctrl+K search button

**Why Both?** Starlight customization requires vanilla JS to avoid context pollution; the React version exists for potential future use outside Starlight.

## Deployment

### GitHub Pages Pipeline

Triggers: Push to `main` or manual dispatch

1. Checkout → Setup Node 20 → npm ci
2. `npm run build` → generates `/dist/`
3. Upload artifact → Deploy to GitHub Pages

### Scripts

```bash
npm run dev      # Local development server
npm run build    # Production build
npm run preview  # Preview production build locally
```

## Common Tasks

### Adding a New Page
1. Create `.astro` file in `src/pages/`
2. Use `BaseLayout` for consistent styling
3. Route is auto-generated from filename

### Modifying Starlight Components
1. Create override in `src/components/starlight/`
2. Reference in `astro.config.mjs` under `starlight.components`

### Updating Auth Logic
- Modify `src/lib/supabase.ts` for auth functions
- Modify `src/components/starlight/Head.astro` for protection logic

## Gotchas & Notes

1. **Supabase Keys:** Anon key is intentionally public (client-side auth). Never commit service role keys.

2. **MDX in Starlight:** Adventures use `.mdx` extension for JSX support in content.

3. **Auth Redirect:** The `?redirect=` param preserves intended destination through login flow.

4. **Dev Mode Auth:** Auth is bypassed on localhost for easier development.

5. **Image Optimization:** Sharp library handles images at build time; place source images in `src/assets/` for optimization or `public/images/` for as-is serving.

6. **Starlight Auto-Routes:** Any `.md`/`.mdx` in `src/content/docs/` auto-generates routes.

7. **Glass Panel Effect:** Requires parent to have a background; doesn't work on transparent containers.

## Brand Language

Use these terms consistently:
- **Guardians** (not "users" or "parents")
- **The Grimoire** (the adventure portal)
- **Forge** metaphor throughout (animations, colors, language)
- Storytelling tone, not generic SaaS language

## Environment Variables

Expected in `.env`:
```
PUBLIC_SUPABASE_URL=https://fhihhvyfluopxcuezqhi.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<anon_key>
PUBLIC_LEMONSQUEEZY_STORE_ID=<store_id>  # Future use
```

Note: `PUBLIC_` prefix exposes variables to client-side code.

## Future Considerations

- LemonSqueezy webhook integration for purchase verification
- Additional adventure content
- User progress tracking in Supabase
- Email confirmation flow refinement
