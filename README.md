# ParableForge

Screen-free family adventures powered by the **Sovereign Engine**.

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build)
[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

**Live Site:** https://playparableforge.com

## Quick Start (Local Development)

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open content admin: `http://localhost:4321/keystatic`
4. View engine demo: `http://localhost:4321/engine-demo`
5. View adventures: `http://localhost:4321/adventure/sky-island` (when created)

## Tech Stack

- **Frontend:** Astro 5.x + React 19.x
- **Docs:** Starlight (for tutorials and resources)
- **CMS:** Keystatic (local-first, Git-based)
- **State:** Nano Stores (lightweight, framework-agnostic)
- **Styling:** Tailwind CSS (Forge Dark theme)
- **Auth:** Supabase (optional, guest mode by default)
- **Hosting:** Vercel (hybrid SSR + static)

## The Sovereign Engine

The core of this project is the **Sovereign Engine** - a universal state management system for gamified experiences.

**What it does:**
- Tracks resources (HP, XP, Trust, etc.)
- Evaluates rules and triggers effects
- Manages turn-based systems with rewind capability
- Creates dramatic "surge" events (plot twists)
- Works offline with localStorage persistence

**Why it matters:**
- 100% decoupled from ParableForge branding
- Can power adventures, courses, habit trackers, etc.
- Zero external dependencies (no Firebase, no paid APIs)
- Framework-agnostic core (works anywhere)

See `/engine-demo` for a live demonstration.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Content Management

This project uses Keystatic (local mode) for content editing. All changes are saved as JSON files in `/content/adventures/`. Commit these files to deploy changes.

**To add a new adventure:**
1. Open `/keystatic` in your browser
2. Click "Create Adventure"
3. Fill in metadata, resources, rules, and content
4. Save (auto-commits to `/content/adventures/`)
5. Build + deploy: `npm run build`

**To edit existing adventures:**
- Use the Keystatic UI for structured content
- Or edit JSON files directly in `/content/adventures/`

## Project Structure

```
src/
├── lib/engine/              # Sovereign Engine core
│   ├── store.ts             # State management
│   ├── types.ts             # TypeScript definitions
│   ├── effects.ts           # Visual effects
│   └── components/          # UI components
├── layouts/
│   ├── BaseLayout.astro     # Main wrapper
│   └── AdventureLayout.astro # Engine-powered pages
├── pages/
│   ├── engine-demo.astro    # Public demo
│   ├── adventure/[slug].astro # Dynamic adventure routes
│   └── keystatic/           # CMS admin (auto-generated)
└── content/docs/            # Starlight documentation

content/adventures/          # Keystatic-managed content
```

## Deployment

**Vercel (Recommended):**
1. Connect repository to Vercel
2. Framework Preset: Astro
3. Build Command: `npm run build`
4. Add environment variables (Supabase keys)
5. Deploy

Keystatic admin works in production (local mode). Content editors clone the repo, edit locally, commit, and push.

## Environment Variables

Required for authentication features:
```
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Note:** Adventures work in "guest mode" without authentication.

## Learn More

- [Astro Documentation](https://docs.astro.build)
- [Starlight Docs](https://starlight.astro.build/)
- [Keystatic Docs](https://keystatic.com/)
- [Nano Stores](https://github.com/nanostores/nanostores)
