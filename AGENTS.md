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
| **CMS** | **Keystatic** | v5.x | Local-first headless CMS with Git storage. |
| **State** | **Nano Stores** | Latest | Lightweight state management for engine. |
| **Payments** | **Lemon Squeezy** | Placeholder | Handles tax/VAT for digital products. |
| **Icons** | **Lucide React** | v0.562.x | Consistent, clean SVG icons. |
| **Hosting** | **Vercel** | Free Tier | Hybrid SSR + static deployment. |

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
│   ├── engine/           # Sovereign Engine UI components
│   │   ├── ResourceCard.tsx
│   │   ├── TurnQueue.tsx
│   │   ├── SurgeOverlay.tsx
│   │   ├── EngineDirector.tsx
│   │   └── ModifierButton.tsx
│   └── starlight/        # Starlight overrides
│       ├── Head.astro    # Injects auth check on compendium pages
│       └── Header.astro  # Adds health tracker to header
├── content/
│   └── docs/compendium/  # Starlight documentation (tutorials, guides)
│       ├── welcome.mdx
│       ├── adventures/   # Legacy adventure scripts
│       └── resources/    # Tutorial content
├── layouts/
│   ├── BaseLayout.astro      # Main page wrapper
│   └── AdventureLayout.astro # Game engine wrapper
├── lib/
│   ├── supabase.ts       # Auth client & helpers
│   └── engine/           # Sovereign Engine core (The Brain)
│       ├── store.ts      # Nano stores for state management
│       ├── types.ts      # TypeScript interfaces
│       ├── effects.ts    # Visual effects (toast, confetti, etc.)
│       └── components/   # React components (see above)
├── pages/                # Route-based pages
│   ├── index.astro       # Landing page
│   ├── login.astro       # Authentication
│   ├── engine-demo.astro # Public component demo
│   ├── adventure/
│   │   └── [slug].astro  # Dynamic adventure routes
│   ├── keystatic/        # CMS admin (auto-generated by integration)
│   ├── setup-grimoire.astro  # Post-purchase onboarding
│   ├── privacy.astro     # Legal
│   └── terms.astro       # Legal
└── styles/
    └── global.css        # Theme, animations, utilities
```

### Key Configuration Files

| File | Purpose |
|------|---------|
| `astro.config.mjs` | Astro + Starlight + Keystatic + integrations setup |
| `tailwind.config.mjs` | Theme colors, custom animations |
| `keystatic.config.ts` | Keystatic CMS schema for adventures & resources |
| `vercel.json` | Vercel deployment configuration |
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

## Sovereign Engine Architecture

### Overview
The Sovereign Engine is a universal state management system for gamified experiences. It powers both adventures (HP/combat) and courses (XP/progress) using the same codebase.

**Design Philosophy:**
- Decoupled from ParableForge (can be extracted for other products)
- Framework-agnostic core (Nano Stores work anywhere)
- Zero external dependencies for state (no Firebase, no Supabase billing)
- Guest Mode by default (auth is optional, not required)

### Core Components

**State Layer (`src/lib/engine/store.ts`)**
- `$engineState`: Resource values (persists to localStorage)
- `$turnHistory`: Turn-by-turn snapshots for rewind feature
- `$firedRules`: Tracks which rules have triggered (prevents spam)
- `$activeSurge`: Currently active surge event (screen-lock overlay)

**Logic Layer (`src/lib/engine/components/EngineDirector.tsx`)**
- Invisible React component
- Subscribes to state changes
- Evaluates rules on every update
- Fires effects (toast, confetti, surge)

**UI Layer**
- `ResourceCard`: Visual display for tracked values
- `TurnQueue`: Turn counter with rewind capability
- `SurgeOverlay`: Full-screen interrupt for dramatic moments
- `ModifierButton`: Testing/debug controls

### Adding Resources to Adventures

1. Open Keystatic admin: `/keystatic`
2. Edit adventure → "Resources" section
3. Add new resource with:
   - **ID**: Unique identifier (e.g. `boss_hp`)
   - **Label**: Display name
   - **Max/Initial**: Number range
   - **Theme**: Color scheme (red/green/blue/gold/purple)
   - **Style**: `bar` (progress), `counter` (number), `hidden` (tracked only)
   - **Icon** (optional): Lucide icon name (Heart, Zap, Shield, etc.)

### Creating Rules

Rules trigger effects when resources meet conditions:

```yaml
targetId: boss_hp       # Which resource to watch
operator: <=            # Condition type (<, >, ==, >=, <=)
threshold: 0            # Trigger value
action: confetti        # Effect to fire
payload: "Victory!"     # Effect data (message, URL, etc.)
```

**Available actions:**
- `toast`: Show message notification
- `confetti`: Celebration animation
- `shake`: Screen shake effect
- `flash`: Red flash overlay
- `redirect`: Navigate to URL
- `unlock`: Save unlock state to localStorage
- `advance_turn`: Automatically progress turn
- `surge`: Trigger surge event by turn number

### Surge Events (Plot Twists)

Surges are dramatic interruptions that:
1. Lock the screen with an overlay
2. Display narrative dialogue for parent to read
3. Modify resources programmatically (e.g., "Goblin drinks potion = +5 HP")
4. (Optional) Force enemy to front of turn queue

**When to use:**
- Boss "enrage" phases
- Unexpected plot twists
- Teaching moments (correct a player mistake)
- Creating memorable "WHOA!" moments

**Example:**
```yaml
triggerTurn: 3
dialogue: "The goblin drinks a potion! His eyes glow red with fury!"
forceFirst: true
animation: flash
modifyResources:
  - resourceId: goblin_hp
    delta: 5
```

### Session Persistence

Resources are saved to `localStorage`:
```
pf-engine (JSON object with all resource values)
pf-session (session ID: "guest-adventureSlug" or "adventureSlug-timestamp")
```

This allows:
- Closing browser mid-adventure → Resume later
- Multiple adventures in separate tabs (isolated state)
- Testing without auth (no database needed)

### Guest Mode (Public Adventure Access)

**Philosophy:**
Adventures at `/adventure/*` are publicly accessible. This reduces friction for new users and demonstrates the engine before requiring signup.

**Implementation:**
- State persists to `localStorage` (works offline, no auth required)
- Session IDs:
  - Guest: `guest-adventureSlug` (predictable key, overwrites on replay)
  - Authenticated: `adventureSlug-timestamp` (unique per playthrough)
- Premium features can be wrapped in `<RequireAuth>` component for upsell

**For productization:**
This pattern demonstrates how to build "freemium" experiences with the StackForge kit.

### Extracting the Engine (Productization)

To create a blank starter kit:
1. Copy `/src/lib/engine/` to new project
2. Copy engine components from `/src/lib/engine/components/`
3. Copy `AdventureLayout.astro` (rename as needed)
4. Update import paths
5. Delete ParableForge-specific content

**The engine is 100% decoupled from ParableForge branding.**

## Content Management

### Keystatic CMS

**Admin Access:**
- Local dev: `http://localhost:4321/keystatic`
- Production: `https://playparableforge.com/keystatic`

**Storage Mode:** Local (files stored in `/content/adventures/` as JSON)

**Collections:**
1. **Adventures** (`/content/adventures/*`)
   - Title, description, duration, difficulty
   - Adventure script (Markdoc content)
   - Resources array (HP, XP, Trust, etc.)
   - Rules array (triggers & effects)
   - Surges array (plot twists)
   - Turns array (optional pre-scripted events)

2. **Resources** (`/src/content/docs/compendium/resources/*`)
   - Tutorial and documentation content
   - Compatible with Starlight auto-generation

**Workflow:**
1. Edit content in Keystatic admin UI
2. Changes save to local files (JSON format)
3. Commit changes to Git
4. Push to trigger Vercel deployment

### Legacy Adventure Content
- **Location:** `src/content/docs/compendium/adventures/`
- **Format:** MDX (Markdown + JSX)
- **Status:** Being migrated to Keystatic format
- **Starlight Integration:** Still works for documentation-style adventures

### Adventure Naming Conventions

**Two-Part System**

ParableForge uses a dual content strategy:

**Interactive Adventures** (`content/adventures/`)
- Format: `{slug}.mdoc`
- Example: `sky-island.mdoc`
- URL: `/adventure/sky-island`
- Title field: Must match filename (e.g., `title: sky-island`)
- Purpose: Playable with full Sovereign Engine

**Adventure Guides** (`src/content/docs/compendium/adventures/`)
- Format: `{slug}-guide.mdx`
- Example: `sky-island-guide.mdx`
- URL: `/compendium/adventures/sky-island-guide/`
- Purpose: Reference documentation, tips, background lore

**Relationship**

The guide is a **companion** to the interactive adventure:
- Guide: Read before playing (optional prep, parent reference)
- Adventure: The actual playable experience with engine

**Creating New Adventures**

**Recommended Workflow:**
1. Use Keystatic admin (`/keystatic`) to create interactive adventure
2. Save to `content/adventures/{slug}.mdoc`
3. **CRITICAL:** Set title field to match filename exactly (e.g., `title: forest-temple` for `forest-temple.mdoc`)
4. Manually create companion guide in `src/content/docs/compendium/adventures/{slug}-guide.mdx`
5. Link between them using PlayAdventureButton (auto-generated) and manual links

**File Naming Rules:**
- ✅ **Good:** `forest-temple.mdoc` → slug: `forest-temple`, title: `forest-temple`
- ✅ **Good:** `dragon-mountain.mdoc` → slug: `dragon-mountain`, title: `dragon-mountain`
- ❌ **Bad:** `Forest Temple.mdoc` → spaces break URLs
- ❌ **Bad:** `forest-temple.mdoc` with `title: Forest Temple` → slug mismatch causes navigation failures
- ❌ **Bad:** `dragon_mountain.mdoc` → underscores not ideal for URLs

**Rule:** Use lowercase with hyphens for all adventure files AND title fields. The title field must match the filename exactly (without the .mdoc extension).

**Why This Matters:**
Keystatic uses `slugField: 'title'` to derive adventure slugs. If the title field doesn't match the filename, navigation will break because:
- URLs use filename: `/adventure/sky-island`
- Keystatic lookup uses title: `getAdventure('Sky Island')` ❌
- Result: Adventure not found error

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

### Vercel Deployment

**Configuration:** Hybrid SSR mode (required for Keystatic admin)

**Build Settings:**
- Framework: Astro (auto-detected)
- Build Command: `npm run build`
- Output Directory: `dist`
- Node Version: 22.x

**Environment Variables:**
```
PUBLIC_SUPABASE_URL=https://fhihhvyfluopxcuezqhi.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<key>
```

**Deployment Flow:**
1. Push to `main` branch
2. Vercel auto-builds and deploys
3. Keystatic admin works in production (local mode)

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

## Error Handling & Content Resilience

### Philosophy: "The Show Must Go On"

ParableForge uses a hybrid content strategy with comprehensive error handling to ensure adventures ALWAYS render, even when content or components fail.

### Content Loading Strategy

**Primary**: Markdoc (rich formatting, component support)  
**Fallback**: Plain Markdown (bulletproof, always works)  
**Error UI**: User-friendly messages with recovery options

**Implementation** (`src/pages/adventure/[slug].astro`):
```typescript
let Content: any = null;
let renderMode: 'markdoc' | 'fallback' | 'error' = 'markdoc';

try {
  // Try Markdoc first
  const result = await content();
  Content = result;
} catch (error) {
  // Fall back to plain markdown
  renderMode = 'fallback';
  // Use MarkdownFallback component
}
```

### Error Boundary Components

All React components in `AdventureLayout` are wrapped in `ErrorBoundary`:
- `GameInitializer` - Catches state initialization errors
- `EngineDirector` - Catches rule evaluation errors
- `DirectorDrawer` - Catches UI rendering errors
- `SurgeOverlay` - Catches surge event errors

**Error Boundary Features**:
- Shows friendly error UI (not blank screen)
- Provides "Retry" and "Reload Page" buttons
- Logs error details to console for debugging
- Displays technical details in collapsed section (dev mode)

### Visual Error Components

**AdventureError.astro** - For build-time/SSR errors:
- Warning yellow theme (not aggressive red)
- Clear action buttons
- "Safe Mode" option to force fallback renderer
- Back to Compendium link

**MarkdownFallback.astro** - Fallback content renderer:
- Strips YAML frontmatter
- Basic markdown-to-HTML conversion
- Shows "Safe Mode Active" banner
- Engine components still work (resources, drawer, etc.)

### Build-Time Validation

**Script**: `scripts/validate-adventures.mjs`

**Checks**:
- ✓ Valid YAML frontmatter
- ✓ Required fields present (title, description, resources)
- ✓ Resources array not empty
- ✓ No duplicate resource IDs
- ✓ Rules reference valid resource IDs
- ✓ Surge events have valid turn numbers
- ✓ Content body exists and is not empty

**Usage**:
```bash
npm run validate           # Run validation only
npm run build              # Validates then builds
npm run build:skip-validation  # Skip validation (emergency)
```

**Exit Codes**:
- `0` = All adventures valid
- `1` = Validation errors found (build fails)

### Console Logging

**Standard Logging** (init + errors only):

```javascript
// GameInitializer
🎮 Initializing Sovereign Engine... { adventure, resources, rules, combatants }

// DirectorDrawer  
📱 DirectorDrawer mounted { resources, combatants, maxTurns, expanded }

// EngineDirector
🎬 EngineDirector mounted { rules, surges }
🎯 Rule triggered: trust >= 20 → toast

// Adventure Route
🔧 [sky-island] Rendering Markdoc content...
✅ [sky-island] Markdoc rendered successfully
🎮 [sky-island] Adventure loaded: { renderMode, resources, rules, surges, combatants, maxTurns }
```

### Creating New Adventures

**Checklist**:
1. ✓ Use Keystatic admin UI (`/keystatic`) to avoid YAML errors
2. ✓ Define at least one resource
3. ✓ Ensure resource IDs are unique and alphanumeric
4. ✓ Rules must reference existing resource IDs
5. ✓ Content body is not empty
6. ✓ Test locally: `npm run dev`
7. ✓ Validate: `npm run validate`
8. ✓ Build: `npm run build`

**Common Mistakes**:
- ❌ Empty resources array → Build fails
- ❌ Rule references non-existent resource → Validation error
- ❌ Duplicate resource IDs → Validation error
- ❌ Missing frontmatter → Renders in fallback mode
- ❌ Invalid YAML syntax → Shows AdventureError

### Safe Mode

Users can force Safe Mode (fallback renderer) by clicking the "Safe Mode" button in error UI. This sets `sessionStorage.getItem('pf-safe-mode') === 'true'` and reloads.

**When Safe Mode Activates**:
- Yellow banner appears: "Safe Mode Active"
- Content renders as plain markdown (no Markdoc components)
- All engine features still work (resources, drawer, surge, etc.)
- User can refresh to exit Safe Mode

### DirectorDrawer Rendering

The DirectorDrawer ALWAYS renders, regardless of content errors:
- Positioned in `AdventureLayout` (outside content slot)
- Wrapped in ErrorBoundary for protection
- Receives validated props (safe arrays, null-coalesced values)
- Logs mount/unmount for debugging

**Mobile**: Sticky footer, 24px collapsed → 70vh expanded  
**Desktop**: Fixed right sidebar, 384px width, always visible

### Future Improvements

- Offline support (Service Worker)
- Telemetry for error tracking (privacy-respecting)
- Automated visual regression tests (Playwright)
- Performance monitoring (Markdoc parse time)

---

## Future Considerations

- LemonSqueezy webhook integration for purchase verification
- Additional adventure content
- User progress tracking in Supabase
- Email confirmation flow refinement
