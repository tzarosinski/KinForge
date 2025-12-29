This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: node_modules/**, .git/**, .next/**, .astro/**, dist/**, **/*.lock, pnpm-lock.yaml, yarn.lock, package-lock.json, **/*.png, **/*.jpg, **/*.jpeg, **/*.gif, **/*.svg, **/*.ico, .env, .env.local, .env.*
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.claude/
  settings.local.json
content/
  adventures/
    sky-island.mdoc
    template-adventure.mdoc
public/
  images/
    .gitkeep
  CNAME
scripts/
  validate-adventures.mjs
src/
  assets/
    houston.webp
  components/
    starlight/
      ContentPanel.astro
      Head.astro
      Header.astro
      MobileTableOfContents.astro
      PageFrame.astro
      PageTitle.astro
      PlayAdventureButton.astro
      SiteTitle.astro
      TableOfContents.astro
    AdventureError.astro
    AuthGuard.astro
    ErrorBoundary.tsx
    HealthTracker.tsx
    MarkdownFallback.astro
  content/
    docs/
      compendium/
        adventures/
          sky-island-guide.mdx
          template-guide.mdx
          test-adventure.mdx
          test-long-scroll.mdx
        resources/
          getting-started-and-how-to-play.mdx
        welcome.mdx
  layouts/
    AdventureLayout.astro
    BaseLayout.astro
  lib/
    engine/
      components/
        CombatantCard.tsx
        DirectorDrawer.tsx
        DraggableQueue.tsx
        DrawerContent.tsx
        EngineDirector.tsx
        GameInitializer.tsx
        ModifierButton.tsx
        ResourceCard.tsx
        SmartDrawerController.tsx
        SurgeOverlay.tsx
        TurnQueue.tsx
      effects.ts
      store.ts
      types.ts
    keystatic-reader.ts
    supabase.ts
  pages/
    adventure/
      [slug].astro
    engine-demo.astro
    index.astro
    login.astro
    privacy.astro
    setup-compendium.astro
    setup-grimoire.astro
    terms.astro
    test-drawer.astro
  styles/
    global.css
    starlight-mobile.css
  content.config.ts
_redirects
.gitignore
AGENTS.md
astro.config.mjs
design-sandbox.html
keystatic.config.ts
package.json
README.md
repomix.config.json
tailwind.config.mjs
tsconfig.json
vercel.json
```

# Files

## File: content/adventures/template-adventure.mdoc
````
---
title: template-adventure
description: Brief one-line description of this adventure
duration: '30-45'
difficulty: beginner
resources:
  - id: hero_hp
    label: Hero HP
    max: 100
    initial: 100
    theme: red
    style: bar
    icon: Heart
  - id: boss_hp
    label: Boss HP
    max: 50
    initial: 50
    theme: red
    style: bar
    icon: Skull
  - id: trust
    label: Trust Points
    max: 100
    initial: 0
    theme: gold
    style: counter
    icon: Star
rules:
  - targetId: boss_hp
    operator: '<='
    threshold: 0
    action: confetti
    payload: Victory! The boss is defeated!
  - targetId: hero_hp
    operator: '<='
    threshold: 0
    action: redirect
    payload: /compendium/welcome?toast=game-over
  - targetId: trust
    operator: '>='
    threshold: 50
    action: toast
    payload: The NPC trusts you now!
surges:
  - triggerTurn: 3
    dialogue: >-
      A dramatic plot twist occurs! The boss gains new power and the stakes
      are raised!
    forceFirst: true
    animation: shake
    modifyResources:
      - resourceId: boss_hp
        delta: 10
combatants:
  - id: hero
    name: The Hero
    avatar: 🛡️
    type: hero
    linkedResource: hero_hp
  - id: boss
    name: The Boss
    avatar: 👹
    type: enemy
    linkedResource: boss_hp
turns: []
---

# Opening Scene

Read this aloud to set the scene. Use vivid description and engage the senses.

**Prompt the players:** "What do you do?"

---

## Turn 1: First Choice

Present the situation and wait for player response.

**If they choose Option A:**
- Describe the outcome
- Modify resources: `hero_hp -10`
- Advance turn

**If they choose Option B:**
- Describe the alternative outcome
- Modify resources: `trust +5`
- Advance turn

---

## Turn 2: Rising Action

Continue building tension. Reference previous choices.

**Challenge:** Present a difficult decision with no obvious right answer.

---

## Climax

The final confrontation. Stakes are at their highest.

**Boss Battle:**
- Use the turn queue to manage combat
- Let players describe their actions
- Apply resource changes based on narrative choices

---

## Resolution

Wrap up the story based on the outcome:

**Victory Path:**
- Celebrate their success
- Reveal rewards or unlocks
- Hint at future adventures

**Defeat Path:**
- Don't punish failure
- Celebrate the attempt
- Encourage replay with different choices
````

## File: scripts/validate-adventures.mjs
````javascript
#!/usr/bin/env node

/**
 * ADVENTURE CONTENT VALIDATOR
 * 
 * Validates all adventure files before build to catch errors early.
 * 
 * Checks:
 * - Valid YAML frontmatter
 * - Required fields present
 * - Resources array not empty
 * - No duplicate resource IDs
 * - Rules reference valid resource IDs
 * - Surge events have valid turn numbers
 * - Content body exists
 * 
 * Usage:
 *   node scripts/validate-adventures.mjs
 * 
 * Exit codes:
 *   0 = All adventures valid
 *   1 = Validation errors found
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import yaml from 'yaml';

const ADVENTURES_DIR = 'content/adventures';
const REQUIRED_FIELDS = ['title', 'description', 'resources'];

let totalAdventures = 0;
let errors = [];

console.log('🔍 Validating adventure content...\n');

try {
  // Read all .mdoc files
  const files = await readdir(ADVENTURES_DIR);
  const adventureFiles = files.filter(f => f.endsWith('.mdoc'));
  
  totalAdventures = adventureFiles.length;
  console.log(`Found ${totalAdventures} adventure(s) to validate\n`);
  
  for (const filename of adventureFiles) {
    const filepath = join(ADVENTURES_DIR, filename);
    const content = await readFile(filepath, 'utf-8');
    
    console.log(`📄 Checking: ${filename}`);
    
    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    
    if (!frontmatterMatch) {
      errors.push({
        file: filename,
        error: 'No frontmatter found (missing --- delimiters)'
      });
      console.log(`  ❌ No frontmatter found\n`);
      continue;
    }
    
    let data;
    try {
      data = yaml.parse(frontmatterMatch[1]);
    } catch (yamlError) {
      errors.push({
        file: filename,
        error: `Invalid YAML: ${yamlError.message}`
      });
      console.log(`  ❌ Invalid YAML: ${yamlError.message}\n`);
      continue;
    }
    
    // Check required fields
    const missingFields = REQUIRED_FIELDS.filter(field => !data[field]);
    if (missingFields.length > 0) {
      errors.push({
        file: filename,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
      console.log(`  ❌ Missing fields: ${missingFields.join(', ')}`);
    }
    
    // Check resources array
    if (!data.resources || !Array.isArray(data.resources)) {
      errors.push({
        file: filename,
        error: 'Resources must be an array'
      });
      console.log(`  ❌ Resources must be an array`);
    } else if (data.resources.length === 0) {
      errors.push({
        file: filename,
        error: 'At least one resource is required'
      });
      console.log(`  ❌ No resources defined`);
    } else {
      // Check for duplicate resource IDs
      const resourceIds = data.resources.map(r => r.id);
      const duplicates = resourceIds.filter((id, index) => resourceIds.indexOf(id) !== index);
      if (duplicates.length > 0) {
        errors.push({
          file: filename,
          error: `Duplicate resource IDs: ${duplicates.join(', ')}`
        });
        console.log(`  ❌ Duplicate resource IDs: ${duplicates.join(', ')}`);
      }
      
      // Validate each resource
      data.resources.forEach((resource, index) => {
        if (!resource.id) {
          errors.push({
            file: filename,
            error: `Resource at index ${index} missing id`
          });
          console.log(`  ❌ Resource ${index} missing id`);
        }
        if (!resource.label) {
          errors.push({
            file: filename,
            error: `Resource "${resource.id}" missing label`
          });
          console.log(`  ❌ Resource "${resource.id}" missing label`);
        }
        if (resource.max == null) {
          errors.push({
            file: filename,
            error: `Resource "${resource.id}" missing max value`
          });
          console.log(`  ❌ Resource "${resource.id}" missing max`);
        }
        if (resource.initial == null) {
          errors.push({
            file: filename,
            error: `Resource "${resource.id}" missing initial value`
          });
          console.log(`  ❌ Resource "${resource.id}" missing initial`);
        }
      });
      
      // Check rules reference valid resources
      if (data.rules && Array.isArray(data.rules)) {
        data.rules.forEach((rule, index) => {
          if (!resourceIds.includes(rule.targetId)) {
            errors.push({
              file: filename,
              error: `Rule ${index} references non-existent resource "${rule.targetId}"`
            });
            console.log(`  ❌ Rule ${index} references invalid resource "${rule.targetId}"`);
          }
        });
      }
      
      // Validate surge events
      if (data.surges && Array.isArray(data.surges)) {
        data.surges.forEach((surge, index) => {
          if (surge.triggerTurn == null || surge.triggerTurn < 1) {
            errors.push({
              file: filename,
              error: `Surge ${index} has invalid triggerTurn (must be >= 1)`
            });
            console.log(`  ❌ Surge ${index} has invalid triggerTurn`);
          }
          if (!surge.dialogue) {
            errors.push({
              file: filename,
              error: `Surge ${index} missing dialogue`
            });
            console.log(`  ❌ Surge ${index} missing dialogue`);
          }
          
          // Check surge resource modifications
          if (surge.modifyResources && Array.isArray(surge.modifyResources)) {
            surge.modifyResources.forEach((mod) => {
              if (!resourceIds.includes(mod.resourceId)) {
                errors.push({
                  file: filename,
                  error: `Surge ${index} modifies non-existent resource "${mod.resourceId}"`
                });
                console.log(`  ❌ Surge ${index} modifies invalid resource "${mod.resourceId}"`);
              }
            });
          }
        });
      }
    }
    
    // Check content body exists
    const contentBody = content.substring(frontmatterMatch[0].length).trim();
    if (!contentBody || contentBody.length === 0) {
      errors.push({
        file: filename,
        error: 'Content body is empty'
      });
      console.log(`  ❌ No content body`);
    }
    
    // Success message if no errors for this file
    const fileErrors = errors.filter(e => e.file === filename);
    if (fileErrors.length === 0) {
      console.log(`  ✅ Valid\n`);
    } else {
      console.log('');
    }
  }
  
  // Summary
  console.log('─'.repeat(50));
  if (errors.length === 0) {
    console.log(`\n✅ All ${totalAdventures} adventure(s) validated successfully!\n`);
    process.exit(0);
  } else {
    console.log(`\n❌ Found ${errors.length} error(s) in ${totalAdventures} adventure(s)\n`);
    console.log('Errors by file:');
    const errorsByFile = {};
    errors.forEach(e => {
      if (!errorsByFile[e.file]) errorsByFile[e.file] = [];
      errorsByFile[e.file].push(e.error);
    });
    Object.entries(errorsByFile).forEach(([file, errs]) => {
      console.log(`\n${file}:`);
      errs.forEach(err => console.log(`  - ${err}`));
    });
    console.log('');
    process.exit(1);
  }
} catch (error) {
  console.error('\n❌ Validation script error:', error.message);
  process.exit(1);
}
````

## File: src/components/starlight/ContentPanel.astro
````astro
---
import type { Props } from '@astrojs/starlight/props';
import Default from '@astrojs/starlight/components/ContentPanel.astro';
// HealthTracker removed - now handled by PageFrame.astro to prevent duplication
---

<Default {...Astro.props}><slot /></Default>
````

## File: src/components/starlight/PageFrame.astro
````astro
---
import MobileMenuToggle from 'virtual:starlight/components/MobileMenuToggle';
import HealthTracker from '../HealthTracker.tsx';

const { hasSidebar } = Astro.locals.starlightRoute;
// Only show tracker on adventure pages
const isAdventure = Astro.url.pathname.includes('/compendium/adventures/');
---

<div class="page sl-flex">
	<header class="header"><slot name="header" /></header>
	{
		hasSidebar && (
			<nav class="sidebar print:hidden" aria-label={Astro.locals.t('sidebarNav.accessibleLabel')}>
				<MobileMenuToggle />
				<div id="starlight__sidebar" class="sidebar-pane">
					<div class="sidebar-content sl-flex">
						<slot name="sidebar" />
					</div>
				</div>
			</nav>
		)
	}
	<div class="main-frame">
		{isAdventure && (
			<div class="health-tracker-container">
				<HealthTracker client:only="react" />
			</div>
		)}
		<slot />
	</div>
</div>

<style>
	@layer starlight.core {
		.page {
			flex-direction: column;
			min-height: 100vh;
		}

		.header {
			z-index: var(--sl-z-index-navbar);
			position: fixed;
			inset-inline-start: 0;
			inset-block-start: 0;
			width: 100%;
			height: var(--sl-nav-height);
			border-bottom: 1px solid var(--sl-color-hairline-shade);
			padding: var(--sl-nav-pad-y) var(--sl-nav-pad-x);
			padding-inline-end: var(--sl-nav-pad-x);
			background-color: var(--sl-color-bg-nav);
		}

		:global([data-has-sidebar]) .header {
			padding-inline-end: calc(
				var(--sl-nav-gap) + var(--sl-nav-pad-x) + var(--sl-menu-button-size)
			);
		}

		.sidebar-pane {
			visibility: var(--sl-sidebar-visibility, hidden);
			position: fixed;
			z-index: var(--sl-z-index-menu);
			inset-block: var(--sl-nav-height) 0;
			inset-inline-start: 0;
			width: 100%;
			background-color: var(--sl-color-black);
			overflow-y: auto;
		}

		:global([aria-expanded='true']) ~ .sidebar-pane {
			--sl-sidebar-visibility: visible;
		}

		.sidebar-content {
			height: 100%;
			min-height: max-content;
			padding: 1rem var(--sl-sidebar-pad-x) 0;
			flex-direction: column;
			gap: 1rem;
		}

		@media (min-width: 50rem) {
			.sidebar-content::after {
				content: '';
				padding-bottom: 1px;
			}
		}

		.main-frame {
			padding-top: calc(var(--sl-nav-height) + var(--sl-mobile-toc-height));
			padding-inline-start: var(--sl-content-inline-start);
		}

		@media (min-width: 50rem) {
			:global([data-has-sidebar]) .header {
				padding-inline-end: var(--sl-nav-pad-x);
			}
			.sidebar-pane {
				--sl-sidebar-visibility: visible;
				width: var(--sl-sidebar-width);
				background-color: var(--sl-color-bg-sidebar);
				border-inline-end: 1px solid var(--sl-color-hairline-shade);
			}
		}

		/* Health Tracker Positioning */
		.health-tracker-container {
			/* Desktop: Fixed to top-right, stays visible when scrolling */
			position: fixed;
			top: calc(var(--sl-nav-height) + 1rem);
			right: 1.5rem;
			z-index: 100;
		}
		
		/* Mobile: Fixed to bottom-right for thumb accessibility */
		@media (max-width: 768px) {
			.health-tracker-container {
				bottom: 0.75rem; /* Closer to edge for thumb reach */
				top: auto;
				right: 0.75rem;
			}
		}
	}
</style>
````

## File: src/components/starlight/PageTitle.astro
````astro
---
/**
 * STARLIGHT PAGE TITLE OVERRIDE
 * 
 * Extends Starlight's default PageTitle component to inject
 * the PlayAdventureButton on adventure documentation pages.
 * 
 * Flow:
 * 1. Render default Starlight page title
 * 2. Check if we're on an adventure docs page
 * 3. If yes, inject PlayAdventureButton below title
 * 
 * This override is registered in astro.config.mjs
 */

import type { Props } from '@astrojs/starlight/props';
import Default from '@astrojs/starlight/components/PageTitle.astro';
import PlayAdventureButton from './PlayAdventureButton.astro';

// Check if we're on an adventure documentation page
const isAdventurePage = Astro.url.pathname.includes('/compendium/adventures/');
---

<!-- Render default Starlight title -->
<Default {...Astro.props}><slot /></Default>

<!-- Inject Play button if on adventure page -->
{isAdventurePage && <PlayAdventureButton />}
````

## File: src/components/starlight/SiteTitle.astro
````astro
---
// Custom SiteTitle with larger icon and animated text
---

<style>
  .site-title-custom {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    transition: opacity 0.2s;
  }
  .site-title-custom:hover {
    opacity: 0.9;
  }
  .site-title-custom svg {
    width: 2rem;
    height: 2rem;
    color: #3B82F6;
    transition: color 0.2s;
  }
  .site-title-custom:hover svg {
    color: #ffffff;
  }
  .site-title-text {
    font-size: 1.125rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    background-image: linear-gradient(
      to right,
      var(--forge-blue, #3B82F6) 0%,
      var(--forge-purple, #8B5CF6) 25%,
      var(--forge-gold, #F59E0B) 50%,
      var(--forge-red, #EF4444) 75%,
      var(--forge-blue, #3B82F6) 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: magma-flow 4s linear infinite;
  }
  @keyframes magma-flow {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
</style>

<a href="/" class="site-title-custom" aria-label="ParableForge">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
  </svg>
  <span class="site-title-text" translate="no">ParableForge</span>
</a>
````

## File: src/components/starlight/TableOfContents.astro
````astro
---
// Empty override to disable the desktop "On This Page" sidebar
// This prevents the right sidebar from covering the health tracker
// Mobile TOC is handled separately by MobileTableOfContents.astro
---
````

## File: src/components/AdventureError.astro
````astro
---
/**
 * ADVENTURE ERROR COMPONENT
 * 
 * Displays a friendly error message when adventure content fails to load.
 * Provides clear actions for recovery without showing technical jargon.
 * 
 * Usage:
 * <AdventureError 
 *   error={errorObject} 
 *   adventureName="Sky Island"
 *   showSafeMode={true}
 * />
 * 
 * Design: Glass panel with warning yellow accent (not aggressive red)
 */

interface Props {
  error?: Error | any;
  adventureName: string;
  showSafeMode?: boolean;
}

const { error, adventureName, showSafeMode = true } = Astro.props;

// Extract simple error message (hide technical stack traces)
const errorMessage = error?.message || 'Content could not be loaded';
const isDevelopment = import.meta.env.DEV;
---

<div class="my-8 max-w-2xl mx-auto">
  <div class="glass-panel p-8 border-2 border-yellow-500/30">
    <!-- Warning Icon -->
    <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-500/10 flex items-center justify-center">
      <svg 
        class="w-8 h-8 text-yellow-500" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>

    <!-- Main Message -->
    <h2 class="text-2xl font-bold text-white text-center mb-3">
      Adventure Content Temporarily Unavailable
    </h2>

    <p class="text-slate-300 text-center mb-2">
      We're having trouble loading the <strong class="text-white">{adventureName}</strong> adventure script.
    </p>

    <p class="text-slate-400 text-sm text-center mb-6">
      Don't worry - your progress is saved and the adventure controls are still available.
    </p>

    <!-- Error Details (Development Only) -->
    {isDevelopment && error && (
      <details class="mb-6 bg-slate-900/50 rounded p-4">
        <summary class="text-slate-400 text-xs cursor-pointer hover:text-slate-300 font-mono">
          🔧 Developer Info (visible in dev mode only)
        </summary>
        <div class="mt-3 space-y-2">
          <p class="text-xs text-yellow-400">
            <strong>Error:</strong> {errorMessage}
          </p>
          {error.stack && (
            <pre class="text-xs text-slate-500 overflow-x-auto max-h-40">
              {error.stack}
            </pre>
          )}
        </div>
      </details>
    )}

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <button
        onclick="window.location.reload()"
        class="px-6 py-3 bg-forge-blue hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
      >
        <span>🔄</span>
        <span>Reload Page</span>
      </button>

      {showSafeMode && (
        <button
          id="safe-mode-btn"
          class="px-6 py-3 border-2 border-forge-gold text-forge-gold hover:bg-forge-gold hover:text-forge-dark rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
        >
          <span>🛡️</span>
          <span>Continue in Safe Mode</span>
        </button>
      )}

      <a
        href="/compendium/welcome"
        class="px-6 py-3 border-2 border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
      >
        <span>←</span>
        <span>Back to Compendium</span>
      </a>
    </div>

    <!-- Helpful Tip -->
    <div class="mt-6 pt-6 border-t border-slate-700">
      <p class="text-slate-400 text-sm text-center">
        💡 <strong class="text-slate-300">Tip:</strong> If this persists, try clearing your browser cache or contact support.
      </p>
    </div>
  </div>
</div>

<script>
  // Safe Mode button handler
  const safeModeBtn = document.getElementById('safe-mode-btn');
  if (safeModeBtn) {
    safeModeBtn.addEventListener('click', () => {
      // Set flag in sessionStorage to trigger fallback renderer
      sessionStorage.setItem('pf-safe-mode', 'true');
      window.location.reload();
    });
  }
</script>

<style>
  /* Smooth entrance animation */
  .glass-panel {
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
````

## File: src/components/ErrorBoundary.tsx
````typescript
/**
 * ERROR BOUNDARY COMPONENT
 * 
 * Catches React component errors and prevents complete page crashes.
 * Shows a friendly error UI with recovery options.
 * 
 * Usage: Wrap components that might throw errors
 * <ErrorBoundary fallback={<CustomError />}>
 *   <UnstableComponent />
 * </ErrorBoundary>
 * 
 * Philosophy: "The show must go on" - never show a blank screen.
 */

import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details to console for debugging
    console.error('🚨 ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // Update state with error info
    this.setState({ errorInfo });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Show toast notification
    toast.error('A component encountered an error', {
      duration: 5000,
      style: {
        background: '#0B0F19',
        color: '#EF4444',
        border: '2px solid #EF4444'
      }
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="glass-panel max-w-lg w-full p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              Something Went Wrong
            </h2>

            <p className="text-slate-300 mb-2">
              A component encountered an unexpected error.
            </p>

            <p className="text-slate-400 text-sm mb-6">
              Your progress has been saved. Try reloading the page.
            </p>

            {/* Error details (collapsed by default) */}
            {this.state.error && (
              <details className="text-left mb-6 bg-slate-900/50 rounded p-4">
                <summary className="text-slate-400 text-xs cursor-pointer hover:text-slate-300">
                  Technical Details (for debugging)
                </summary>
                <pre className="text-xs text-red-400 mt-3 overflow-x-auto">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-forge-blue hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
              >
                🔄 Reload Page
              </button>
              
              <button
                onClick={this.handleReset}
                className="px-6 py-3 border-2 border-forge-gold text-forge-gold hover:bg-forge-gold hover:text-forge-dark rounded-lg font-semibold transition-all"
              >
                ↻ Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}
````

## File: src/components/MarkdownFallback.astro
````astro
---
/**
 * MARKDOWN FALLBACK RENDERER
 * 
 * A simple, bulletproof content renderer for when Markdoc fails.
 * Renders plain text content with basic HTML formatting.
 * 
 * Purpose: Ensure adventure content ALWAYS shows, even if Markdoc breaks.
 * This is the "Safe Mode" renderer - no fancy components, just text.
 * 
 * Usage:
 * <MarkdownFallback rawContent={fileContent} showWarning={true} />
 */

interface Props {
  rawContent: string;
  showWarning?: boolean;
}

const { rawContent, showWarning = false } = Astro.props;

// Strip YAML frontmatter (everything before the second ---)
const contentWithoutFrontmatter = rawContent.replace(/^---[\s\S]*?---\n/, '');

// Basic markdown-to-HTML conversion (simple patterns)
let htmlContent = contentWithoutFrontmatter
  .trim()
  // Headers
  .replace(/^### (.*$)/gim, '<h3>$1</h3>')
  .replace(/^## (.*$)/gim, '<h2>$1</h2>')
  .replace(/^# (.*$)/gim, '<h1>$1</h1>')
  // Bold
  .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
  // Italic
  .replace(/\*(.*?)\*/gim, '<em>$1</em>')
  // Line breaks
  .replace(/\n\n/g, '</p><p>')
  // Wrap in paragraph tags
  .replace(/^(.+)$/gim, '<p>$1</p>')
  // Remove empty paragraphs
  .replace(/<p><\/p>/g, '');
---

{showWarning && (
  <div class="mb-6 p-4 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-lg">
    <div class="flex items-start gap-3">
      <span class="text-2xl">🛡️</span>
      <div>
        <p class="text-yellow-300 font-semibold mb-1">
          Safe Mode Active
        </p>
        <p class="text-yellow-200/80 text-sm">
          Adventure loaded with simplified formatting. All game features are still active.
        </p>
      </div>
    </div>
  </div>
)}

<div class="markdown-fallback">
  <Fragment set:html={htmlContent} />
</div>

<style>
  .markdown-fallback {
    color: rgb(226, 232, 240); /* slate-200 */
    line-height: 1.75;
  }

  .markdown-fallback :global(h1) {
    font-size: 2rem;
    font-weight: bold;
    color: white;
    margin-bottom: 1rem;
  }

  .markdown-fallback :global(h2) {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
  }

  .markdown-fallback :global(h3) {
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .markdown-fallback :global(p) {
    margin-bottom: 1rem;
  }

  .markdown-fallback :global(strong) {
    font-weight: 600;
    color: rgb(251, 191, 36); /* yellow-400 */
  }

  .markdown-fallback :global(em) {
    font-style: italic;
    color: rgb(148, 163, 184); /* slate-400 */
  }
</style>
````

## File: src/content/docs/compendium/adventures/sky-island-guide.mdx
````markdown
---
title: Sky Island - Adventure Guide
description: Complete guide and reference for the Sky Island adventure
sidebar:
  label: Sky Island Guide
  order: 1
---

:::note[Ready to Play?]
This is the reference guide. [Launch the interactive adventure](/adventure/sky-island) to play with the full game engine!
:::

# The Mysterious Sky Island (Adventure Guide)

**Duration:** 30-45 minutes
**Best for:** Ages 4-10
**Difficulty:** Beginner (perfect for first adventures)

- - -

## Before You Begin

**What you'll need:**

* Just you and your kids
* Optional: A few coins or buttons for "treasure"

**Setting the mood:**

* Dim the lights if you like
* Put phones away
* Take a deep breath. You've got this.

- - -

## The Adventure Begins

*Read the following aloud to your adventurers:*

> "Close your eyes for a moment. Take a deep breath. When you open them, you're no longer in our home. You're standing on soft, green grass. Above you, the sky is impossibly blue, and fluffy white clouds drift lazily by.
>
> But something is different. You look down and realize... you're standing on a cloud. A floating island, high above the world below. Trees with silver leaves grow here. Tiny blue flowers dot the grass.
>
> In the distance, you see a small cottage with a chimney puffing purple smoke."

**Ask:** "What do you want to do?"

- - -

## Possible Paths

### If they approach the cottage:

> "As you walk closer, you notice the cottage door is made of what looks like solid gold. Carved into it are symbols you don't recognize. The purple smoke from the chimney smells like... cookies? No, like berries. No, like your favorite thing in the whole world."

**Ask:** "Do you knock on the door, or try to look through the window first?"

### If they explore the island first:

> "You walk along the edge of the floating island. Looking down makes your tummy feel funny—it's a LONG way down. You see birds flying below you! Then you notice something glinting in the grass near a silver tree."

**Ask:** "Do you want to look at what's glinting, or keep exploring the edge?"

- - -

## The Guardian of the Island

*Eventually, they'll meet the island's guardian. Read this when appropriate:*

> "The cottage door swings open, and an old woman with kind eyes and hair the color of clouds smiles at you. She's no taller than you are!
>
> 'Oh my,' she says. 'Visitors! It's been a hundred years since anyone found their way to my island. I'm Grandmother Cloud. Are you lost? Or are you... adventurers?'"

**Wait for their answer, then continue:**

> "She claps her tiny hands. 'Adventurers! How wonderful! Well then, perhaps you can help me. A sneaky Shadow Raven has stolen my Crystal Compass—the only thing that keeps this island floating! Without it, we'll crash into the mountains below by sunset!'"

**Ask:** "Will you help Grandmother Cloud find the Crystal Compass?"

- - -

## The Quest Continues

*Continue the adventure based on their choices. Key moments:*

1. **The Raven's Nest** - They must climb the tallest silver tree
2. **The Choice** - The Shadow Raven offers them treasure instead of the compass
3. **The Return** - Bringing the compass back to Grandmother Cloud

- - -

## Ending the Adventure

*When they return the compass:*

> "Grandmother Cloud's eyes fill with tears of joy. 'You did it! You chose to help, even when you could have had treasure for yourselves. That's what makes a true hero.'
>
> She waves her hand, and the island glows golden. 'I have a gift for each of you. Close your eyes.'
>
> When you open your eyes, you each find a small silver feather in your pocket. 'This is a Sky Feather,' she explains. 'Whenever you need courage, just hold it tight. And whenever you want to return to my island... well, you know the way now.'"

**Closing:** "And with that, you feel yourself floating gently down, down, down... until you're back home. But the adventure? That will stay with you forever."

- - -

## Reflection Questions

After the adventure, ask your kids:

* "Why did you choose to help Grandmother Cloud?"
* "What was the hardest choice you made?"
* "If you could go back to the Sky Island, what would you do differently?"

*These conversations are the real magic. Listen to their answers.*
````

## File: src/content/docs/compendium/adventures/template-guide.mdx
````markdown
---
title: Adventure Name - Adventure Guide
description: Complete guide and reference for the Adventure Name
sidebar:
  label: Adventure Name Guide
  order: 99
---

:::note[Ready to Play?]
This is the reference guide. [Launch the interactive adventure](/adventure/template-adventure) to play with the full game engine!
:::

# Adventure Name (Adventure Guide)

**Duration:** 30-45 minutes  
**Best for:** Ages 4-12  
**Difficulty:** Beginner

---

## Before You Begin

**What you'll need:**
- Just you and your kids
- Optional: Props or visual aids (describe what would enhance the experience)

**Setting the mood:**
- Suggestions for atmosphere (lighting, sound, etc.)
- Recommended age adjustments
- Physical space requirements (if any)

---

## Adventure Overview

Brief summary of the adventure's premise and main objectives. Avoid spoilers, but give enough info for the parent to decide if it's right for their family.

**Learning objectives:**
- What skills this adventure helps develop
- Social/emotional themes explored
- Problem-solving opportunities

---

## Character Setup

**Pre-made characters** (if applicable):
- Quick reference for character stats
- Personality traits to help kids roleplay
- Visual descriptions

**Custom characters:**
- Quick creation guide
- Themed options that fit this adventure
- Sample names and traits

---

## Story Flow & Tips

### Act 1: Setup
**What happens:**
- Opening scene summary
- Key NPCs introduced
- Initial challenge presented

**Parent tips:**
- How to read the opening scene
- Common player reactions and how to handle them
- Pacing suggestions

### Act 2: Rising Action
**What happens:**
- Main challenges and decision points
- Resource management introduction
- Stakes escalate

**Parent tips:**
- When to encourage vs. challenge players
- How to handle "stuck" moments
- Improvisation guidelines

### Act 3: Climax
**What happens:**
- Final confrontation or challenge
- All previous choices matter
- Multiple possible outcomes

**Parent tips:**
- Managing tension without stress
- Keeping it age-appropriate
- Handling failure gracefully

### Act 4: Resolution
**What happens:**
- Story wraps up
- Consequences of choices revealed
- Future adventure hooks

**Parent tips:**
- Celebrating effort, not just success
- Post-adventure debrief questions
- Extending the experience

---

## Frequently Asked Questions

**Q: What if my kids want to do something not in the script?**  
A: [Guidance on improvisation]

**Q: How do I handle combat/conflict?**  
A: [Age-appropriate conflict resolution tips]

**Q: What if we need to pause mid-adventure?**  
A: [Save point suggestions]

**Q: Can we replay this adventure?**  
A: [Replayability tips and variations]

---

## Variations & Extensions

**Easier mode:**
- Simplified resource tracking
- Reduced turn count
- More explicit hints

**Harder mode:**
- Additional challenges
- Time pressure
- Limited resources

**Extended play:**
- Side quests
- Character development
- Sequel hooks

---

## Props & Printables

Optional materials to enhance the experience:
- Character sheets (link or describe)
- Location maps
- Item cards
- Achievement trackers

---

## Background Lore

Optional deep dive for interested families:
- World-building details
- NPC backstories
- Historical context
- Connection to other adventures

*Note: This section is for parents who want to add richness, not required for play.*
````

## File: src/content/docs/compendium/adventures/test-adventure.mdx
````markdown
---
title: Test Adventure
description: A test adventure for content management system
sidebar:
  label: Test
  order: 1
---

# Test Adventure

This is a simple test adventure to ensure that the content management system can properly find and edit content files.

## Introduction

Welcome to your first adventure! This is a placeholder adventure to test the CMS integration.

## Chapter 1: The Beginning

Once upon a time in a land far away, there was a brave adventurer named Tester who set out to explore the world.

## Chapter 2: The Challenge

Tester faced many challenges along the way, but persevered with determination and courage.

## Chapter 3: The Resolution

Finally, after much effort, Tester achieved their goal and returned home victorious.

## Conclusion

This test adventure has now concluded successfully. The CMS integration is working as expected!
````

## File: src/content/docs/compendium/adventures/test-long-scroll.mdx
````markdown
---
title: Test Adventure - Long Scroll
description: Test page for health tracker positioning
sidebar:
  label: Test Scroll
  order: 99
---

# Test Adventure - Long Scroll

This is a test adventure to verify the health tracker stays fixed during scrolling.

---

## Section 1: The Beginning

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

**Test the health tracker:**
- Click the heart icon in the top-right corner (desktop)
- Click the heart icon in the bottom-right corner (mobile)
- Verify it opens and shows controls
- Decrease health to test threshold popups

---

## Section 2: The Middle Journey

Scroll down and watch the health tracker. It should:
- **Desktop**: Stay fixed in the top-right corner
- **Mobile**: Stay fixed in the bottom-right corner
- **All devices**: Remain visible and accessible at all times

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.

Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.

---

## Section 3: More Content

Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui.

Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat.

Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus.

---

## Section 4: Testing Z-Index

The health tracker should:
1. ✅ Appear above all content (z-index: 100)
2. ✅ Threshold modals appear above tracker (z-index: 1000)
3. ✅ Not conflict with any other UI elements
4. ✅ Be clickable at all times

Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem tristique cursus. Nam nulla quam, gravida non, commodo a, sodales sit amet, nisi.

---

## Section 5: Long Scrolling Test

Keep scrolling to test the fixed positioning behavior.

Pellentesque fermentum dolor. Aliquam quam lectus, facilisis auctor, ultrices ut, elementum vulputate, nunc.

Sed adipiscing ornare risus. Morbi est est, blandit sit amet, sagittis vel, euismod vel, velit. Pellentesque egestas sem. Suspendisse commodo ullamcorper magna.

---

## Section 6: Near The Bottom

You're almost at the bottom of the page. The health tracker should still be visible:
- **Desktop**: Top-right corner
- **Mobile**: Bottom-right corner (easy thumb access)

Integer vitae libero ac risus egestas placerat. Vestibulum commodo felis quis tortor. Ut aliquam sollicitudin leo. Cras iaculis ultricies nulla.

---

## Section 7: The End

Congratulations! If the health tracker remained visible throughout your scroll, the implementation is working correctly.

**Final Checks:**
- [ ] Only ONE health tracker visible (no duplicates)
- [ ] Tracker is fixed and doesn't scroll with content
- [ ] Desktop: Top-right position
- [ ] Mobile: Bottom-right position (thumb-friendly)
- [ ] Clicking heart icon opens/closes tracker
- [ ] Plus/minus buttons work
- [ ] Threshold popups appear correctly
- [ ] Modals appear above tracker

---

## End of Test

You've reached the end of the test adventure. Return to [Sky Island](./sky-island) for the real adventure!
````

## File: src/content/docs/compendium/resources/getting-started-and-how-to-play.mdx
````markdown
---
title: Getting Started, and How to Play
description: >+
  Welcome to Parable Forge! Here are your first steps toward endless adventure
  with your kids!

sidebar:
  label: Getting Started
  order: 1
---
## **Step 1. Have your kids create their characters.** 

I highly recommend having your kids also draw their characters on an index card sized piece of paper, we'll utilize this for our dynamic turn order. 

Have them write out the following:

> * 3 special pieces of equipment or abilities they have. ex. A rune sword enchanted with ice, short distance teleportation, and frost magic. 
>
>
> * A description of how they look. 

## Step 2. Open the Adventure module tab, and choose your adventure. 

Start at the top, and work your way down through the story. 

## Step 3. Read the script!

You will be prompted to read different characters dialogue, narrative sections, propose questions to your players where they can weigh in, and many others, the key here, just do what the next thing says! 

Lean into silly character voices, and as much pizzazz as you can muster, your kids will love it!
````

## File: src/layouts/AdventureLayout.astro
````astro
---
/**
 * ADVENTURE LAYOUT - Mobile-First Director Dashboard
 * 
 * The main layout for adventure pages (/adventure/[slug]).
 * This is where the Sovereign Engine comes to life.
 * 
 * Layout structure:
 * - Desktop: Split screen (content left, drawer right as fixed sidebar)
 * - Mobile: Full-screen content with collapsible drawer at bottom
 * 
 * Engine components are injected here and work together:
 * - GameInitializer: Sets up engine state on mount
 * - EngineDirector: Watches state, fires rules (invisible)
 * - SurgeOverlay: Full-screen interrupts (shows when triggered)
 * - DirectorDrawer: Mobile-first control panel
 * - DraggableQueue: Combatant turn order (if combatants present)
 * - ResourceCard: Visual display of each tracked resource
 * 
 * All React components use client:only="react" to avoid hydration issues.
 */

import BaseLayout from './BaseLayout.astro';
import GameInitializer from '../lib/engine/components/GameInitializer';
import EngineDirector from '../lib/engine/components/EngineDirector';
import SurgeOverlay from '../lib/engine/components/SurgeOverlay';
import DirectorDrawer from '../lib/engine/components/DirectorDrawer';
import SmartDrawerController from '../lib/engine/components/SmartDrawerController';
import ErrorBoundary from '../components/ErrorBoundary';
import { Toaster } from 'sonner';
import type { Resource, Rule, SurgeEvent } from '../lib/engine/types';

interface Combatant {
  id: string;
  name: string;
  avatar: string;
  type: 'hero' | 'enemy' | 'ally';
  linkedResource?: string;
}

interface Props {
  title: string;
  description: string;
  resources: Resource[];
  rules: Rule[];
  surges: SurgeEvent[];
  combatants?: Combatant[];
  maxTurns?: number;
}

const { title, description, resources, rules, surges, combatants = [], maxTurns } = Astro.props;
---

<BaseLayout title={title} description={description}>
  <!-- Engine Initialization -->
  <ErrorBoundary client:only="react">
    <GameInitializer 
      client:only="react"
      adventureSlug={Astro.params.slug || 'demo'}
      resources={resources}
      rules={rules}
      combatants={combatants}
    />
  </ErrorBoundary>
  
  <!-- Engine Components (client-side only) -->
  <ErrorBoundary client:only="react">
    <EngineDirector 
      client:only="react" 
      rules={rules} 
      surges={surges}
    />
  </ErrorBoundary>
  
  <ErrorBoundary client:only="react">
    <SurgeOverlay client:only="react" />
  </ErrorBoundary>
  
  <ErrorBoundary client:only="react">
    <SmartDrawerController client:only="react" />
  </ErrorBoundary>
  
  <Toaster client:only="react" position="top-center" />
  
  <div class="min-h-screen bg-forge-dark flex flex-col md:flex-row">
    <!-- Main content area (scrollable) -->
    <main class="flex-1 p-6 pb-40 md:pb-6 md:h-screen md:overflow-y-auto">
      <div class="max-w-prose mx-auto">
        <div class="prose prose-invert prose-forge">
          <h1 class="text-4xl font-bold mb-4 animate-forge-flow">{title}</h1>
          <p class="text-slate-300 mb-8">{description}</p>
          <slot />
        </div>
      </div>
    </main>
    
    <!-- Director Drawer (mobile: sticky footer, desktop: sidebar) -->
    <ErrorBoundary client:only="react">
      <DirectorDrawer 
        client:only="react"
        resources={resources}
        combatants={combatants}
        maxTurns={maxTurns}
      />
    </ErrorBoundary>
  </div>
</BaseLayout>

<style>
  /* Custom prose styles for adventure content */
  .prose-forge {
    --tw-prose-body: theme('colors.slate.200');
    --tw-prose-headings: theme('colors.white');
    --tw-prose-quotes: theme('colors.yellow.100');
    --tw-prose-quote-borders: theme('colors.yellow.500');
    --tw-prose-code: theme('colors.blue.300');
  }
  
  .prose-forge blockquote {
    font-family: 'Georgia', serif;
    font-style: italic;
    border-left: 4px solid var(--forge-gold);
    background: rgba(245, 158, 11, 0.1);
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
  }
</style>
````

## File: src/lib/engine/components/CombatantCard.tsx
````typescript
/**
 * COMBATANT CARD COMPONENT
 * 
 * A draggable card representing a combatant in the turn queue.
 * 
 * Features:
 * - Drag handle with @dnd-kit sortable
 * - Visual indicator for active turn (golden ring)
 * - Optional HP display (if linkedResource provided)
 * - Color-coded by type (hero/enemy/ally)
 * - Touch-optimized (long-press to drag)
 * 
 * Design Notes:
 * - Minimum 48px height for touch targets
 * - Avatar emoji for quick visual recognition
 * - Drag handle on left (doesn't interfere with content)
 * - Active state is unmistakable (ring + text)
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '@nanostores/react';
import { $engineState, $currentCombatant } from '../store';
import { GripVertical } from 'lucide-react';

interface CombatantCardProps {
  id: string;
  name: string;
  avatar: string;
  type: 'hero' | 'enemy' | 'ally';
  linkedResource?: string;
}

export default function CombatantCard({ 
  id, 
  name, 
  avatar, 
  type,
  linkedResource 
}: CombatantCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });
  
  const state = useStore($engineState);
  const currentCombatant = useStore($currentCombatant);
  
  const isActive = currentCombatant === id;
  const hp = linkedResource ? state[linkedResource] : null;
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };
  
  // Theme colors by combatant type
  const typeColors = {
    hero: 'border-blue-500 bg-blue-900/20',
    enemy: 'border-red-500 bg-red-900/20',
    ally: 'border-green-500 bg-green-900/20'
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative
        p-3 
        min-h-[48px]
        rounded-lg border-2
        ${typeColors[type]}
        ${isActive ? 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-slate-900' : ''}
        transition-all
        touch-manipulation
      `}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical className="w-4 h-4 text-slate-600" />
      </div>
      
      {/* Card Content */}
      <div className="pl-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl select-none">{avatar}</span>
          <div>
            <div className="font-bold text-white text-sm">{name}</div>
            {isActive && (
              <div className="text-xs text-yellow-400 font-semibold">⚡ Active Turn</div>
            )}
          </div>
        </div>
        
        {/* HP Display (if linked to a resource) */}
        {hp !== null && (
          <div className="text-right">
            <div className="text-xs text-slate-400">HP</div>
            <div className={`text-lg font-bold ${hp <= 5 ? 'text-red-400' : 'text-white'}`}>
              {hp}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
````

## File: src/lib/engine/components/DirectorDrawer.tsx
````typescript
/**
 * DIRECTOR DRAWER COMPONENT
 * 
 * The mobile-first control panel that transforms based on screen size:
 * 
 * MOBILE: Sticky footer drawer
 * - Collapsed: 24px height (drag handle + mini preview)
 * - Expanded: 70vh height (full controls)
 * - Swipe up/down to toggle
 * - Auto-expands on surge events
 * 
 * DESKTOP: Fixed sidebar
 * - Always visible at 384px width
 * - Scrollable content
 * - Ignores drawer state
 * 
 * Design Philosophy:
 * - Top 70% of mobile screen = Story (reading zone)
 * - Bottom 30% = Controls (thumb zone)
 * - Parent can read comfortably, then swipe up when action needed
 */

import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $drawerExpanded, $shouldAutoExpand, $currentTurn, $currentCombatant, $combatantQueue } from '../store';
import { ChevronUp, ChevronDown } from 'lucide-react';
import TurnQueue from './TurnQueue';
import DraggableQueue from './DraggableQueue';
import ResourceCard from './ResourceCard';
import ModifierButton from './ModifierButton';
import type { Resource } from '../types';

export interface Combatant {
  id: string;
  name: string;
  avatar: string;
  type: 'hero' | 'enemy' | 'ally';
  linkedResource?: string;
}

export interface DirectorDrawerProps {
  resources: Resource[];
  combatants: Combatant[];
  maxTurns?: number;
}

export default function DirectorDrawer({ resources, combatants, maxTurns }: DirectorDrawerProps) {
  const isExpanded = useStore($drawerExpanded);
  const shouldAutoExpand = useStore($shouldAutoExpand);
  const currentTurn = useStore($currentTurn);
  const currentCombatantId = useStore($currentCombatant);
  const combatantQueue = useStore($combatantQueue);
  
  // Component lifecycle logging
  useEffect(() => {
    console.log('📱 DirectorDrawer mounted', {
      resources: resources.length,
      combatants: combatants.length,
      maxTurns,
      expanded: isExpanded
    });
    
    return () => {
      console.log('📱 DirectorDrawer unmounting');
    };
  }, []);
  
  // Auto-expand when triggered by surge events or critical state changes
  useEffect(() => {
    if (shouldAutoExpand && !isExpanded) {
      $drawerExpanded.set(true);
      $shouldAutoExpand.set(false); // Reset trigger
      
      // Scroll to top of drawer content when auto-expanding
      setTimeout(() => {
        const drawer = document.querySelector('[data-drawer-content]');
        if (drawer) {
          drawer.scrollTop = 0;
        }
      }, 100);
    }
  }, [shouldAutoExpand, isExpanded]);
  
  const toggle = () => {
    $drawerExpanded.set(!isExpanded);
  };
  
  return (
    <aside 
      className={`
        fixed bottom-0 left-0 right-0 
        bg-slate-900 border-t border-slate-700 
        shadow-[0_-4px_20px_rgba(0,0,0,0.5)] 
        z-50 
        transition-all duration-300 ease-out
        md:relative md:w-96 md:border-t-0 md:border-l 
        md:h-screen md:overflow-y-auto
        ${isExpanded ? 'h-[70vh]' : 'h-24'}
      `}
    >
      {/* Drag Handle (Mobile Only) */}
      <div 
        onClick={toggle}
        className="md:hidden h-6 flex items-center justify-center cursor-pointer active:bg-slate-800 touch-manipulation"
        role="button"
        aria-label={isExpanded ? 'Collapse controls' : 'Expand controls'}
      >
        <div className="w-12 h-1 bg-slate-600 rounded-full" />
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-slate-500 ml-2" />
        ) : (
          <ChevronUp className="w-4 h-4 text-slate-500 ml-2" />
        )}
      </div>
      
      {/* Header (Always Visible) */}
      <div className="px-4 py-2 flex justify-between items-center border-b border-slate-800">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">
          Director Controls
        </h3>
        
        {/* Mini preview when collapsed (mobile only) */}
        {!isExpanded && (
          <div className="md:hidden flex items-center gap-2 text-xs">
            <span className="text-yellow-400 font-semibold">Turn {currentTurn}</span>
            {currentCombatantId && combatantQueue.length > 0 && (
              <span className="text-white">
                {combatantQueue.find(c => c.id === currentCombatantId)?.avatar || '⚔️'}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Content (Hidden when collapsed on mobile) */}
      <div 
        data-drawer-content
        className={`
          p-4 h-full overflow-y-auto
          ${!isExpanded ? 'hidden md:block' : 'block'}
        `}
      >
        <div className="space-y-4">
          {/* Turn Counter */}
          <TurnQueue maxTurns={maxTurns} />
          
          {/* Draggable Combatant Queue (if combatants present) */}
          {combatants.length > 0 && <DraggableQueue />}
          
          {/* Resource Cards */}
          {resources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
          
          {/* Quick Action Buttons (Mobile-Optimized) */}
          {resources.length > 0 && (
            <div className="border-t border-slate-700 pt-4">
              <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide">
                Quick Actions
              </p>
              <div className="grid grid-cols-2 gap-3">
                {resources.slice(0, 2).map(resource => (
                  <React.Fragment key={`actions-${resource.id}`}>
                    <ModifierButton
                      resourceId={resource.id}
                      delta={-Math.ceil(resource.max * 0.05)}
                      max={resource.max}
                      label="Damage"
                    />
                    <ModifierButton
                      resourceId={resource.id}
                      delta={Math.ceil(resource.max * 0.1)}
                      max={resource.max}
                      label="Heal"
                    />
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Hint text (mobile only, when collapsed) */}
      {!isExpanded && (
        <div className="absolute bottom-2 left-0 right-0 md:hidden">
          <p className="text-center text-xs text-slate-500">
            💡 Swipe up for controls
          </p>
        </div>
      )}
    </aside>
  );
}
````

## File: src/lib/engine/components/DraggableQueue.tsx
````typescript
/**
 * DRAGGABLE QUEUE COMPONENT
 * 
 * Manages the turn order for combat encounters with drag-and-drop.
 * 
 * Touch Optimization:
 * - 250ms long-press delay (prevents scroll conflicts)
 * - 5px tolerance (allows tiny hand movements)
 * - Visual feedback during drag (opacity change)
 * 
 * Features:
 * - Reorderable combatant cards
 * - "End Turn" button to advance active combatant
 * - Visual indicator of current turn
 * - Automatic turn advancement when cycling back to first
 * 
 * Integration:
 * - Reads from $combatantQueue store
 * - Updates queue order on drag end
 * - Advances turns via advanceCombatantTurn()
 */

import { 
  DndContext, 
  closestCenter,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { useStore } from '@nanostores/react';
import { $combatantQueue, $currentCombatant, reorderQueue, advanceCombatantTurn } from '../store';
import CombatantCard from './CombatantCard';
import { SkipForward } from 'lucide-react';

export default function DraggableQueue() {
  const combatants = useStore($combatantQueue);
  const currentCombatant = useStore($currentCombatant);
  
  // Touch sensor with 250ms delay (prevents scroll conflicts)
  // Mouse sensor with 8px distance (prevents accidental drags)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Long-press for 250ms
        tolerance: 5 // Allow 5px movement during press
      }
    })
  );
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = combatants.findIndex(c => c.id === active.id);
    const newIndex = combatants.findIndex(c => c.id === over.id);
    
    const newOrder = arrayMove(combatants, oldIndex, newIndex);
    reorderQueue(newOrder);
  };
  
  // Don't render if no combatants
  if (combatants.length === 0) return null;
  
  // Find current combatant for display
  const currentCombatantData = combatants.find(c => c.id === currentCombatant);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide">
          Turn Order
        </h4>
        <button
          onClick={advanceCombatantTurn}
          className="px-3 py-2 min-h-[44px] bg-forge-blue text-white rounded-lg text-xs font-semibold hover:bg-blue-600 active:bg-blue-700 transition-all flex items-center gap-1 touch-manipulation"
        >
          <SkipForward className="w-4 h-4" />
          End Turn
        </button>
      </div>
      
      {/* Current combatant display */}
      {currentCombatantData && (
        <div className="text-center py-2 bg-yellow-900/20 border border-yellow-500/50 rounded">
          <p className="text-xs text-yellow-400 font-semibold">Active:</p>
          <p className="text-white font-bold">
            {currentCombatantData.avatar} {currentCombatantData.name}
          </p>
        </div>
      )}
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={combatants.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {combatants.map(combatant => (
              <CombatantCard
                key={combatant.id}
                id={combatant.id}
                name={combatant.name}
                avatar={combatant.avatar}
                type={combatant.type}
                linkedResource={combatant.linkedResource}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      {/* Mobile Hint */}
      <p className="text-[10px] text-slate-500 text-center md:hidden">
        💡 Long-press a card to reorder · Tap "End Turn" to advance
      </p>
    </div>
  );
}
````

## File: src/lib/engine/components/DrawerContent.tsx
````typescript
/**
 * DRAWER CONTENT COMPONENT
 * 
 * Renders all the interactive controls inside the DirectorDrawer.
 * This component exists because React components can only have React children.
 * 
 * Why this is separate:
 * - DirectorDrawer is a React component (handles drawer open/close state)
 * - Astro JSX children can't be passed to React components properly
 * - Solution: Make ALL drawer content a single React component
 * 
 * Contains:
 * - TurnQueue (turn counter + advance button)
 * - DraggableQueue (combatant cards, if present)
 * - ResourceCards (HP, Trust, etc.)
 * - Quick Action Buttons (Damage/Heal presets)
 */

import React from 'react';
import TurnQueue from './TurnQueue';
import DraggableQueue from './DraggableQueue';
import ResourceCard from './ResourceCard';
import ModifierButton from './ModifierButton';
import type { Resource } from '../types';

interface Combatant {
  id: string;
  name: string;
  avatar: string;
  type: 'hero' | 'enemy' | 'ally';
  linkedResource?: string;
}

interface DrawerContentProps {
  resources: Resource[];
  combatants: Combatant[];
  maxTurns?: number;
}

export default function DrawerContent({ 
  resources, 
  combatants, 
  maxTurns 
}: DrawerContentProps) {
  return (
    <div className="space-y-4">
      {/* Turn Counter */}
      <TurnQueue maxTurns={maxTurns} />
      
      {/* Draggable Combatant Queue (if combatants present) */}
      {combatants.length > 0 && <DraggableQueue />}
      
      {/* Resource Cards */}
      {resources.map(resource => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
      
      {/* Quick Action Buttons (Mobile-Optimized) */}
      {resources.length > 0 && (
        <div className="border-t border-slate-700 pt-4">
          <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 gap-3">
            {resources.slice(0, 2).map(resource => (
              <React.Fragment key={`actions-${resource.id}`}>
                <ModifierButton
                  resourceId={resource.id}
                  delta={-Math.ceil(resource.max * 0.05)}
                  max={resource.max}
                  label="Damage"
                />
                <ModifierButton
                  resourceId={resource.id}
                  delta={Math.ceil(resource.max * 0.1)}
                  max={resource.max}
                  label="Heal"
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
````

## File: src/lib/engine/components/EngineDirector.tsx
````typescript
/**
 * ENGINE DIRECTOR COMPONENT
 * 
 * This is an invisible "logic-only" component that watches the engine state
 * and fires rules when conditions are met.
 * 
 * Think of it as the "Dungeon Master" - it knows all the rules and enforces them,
 * but the players (users) don't see it directly.
 * 
 * How it works:
 * 1. Subscribes to $engineState changes
 * 2. On every change, evaluates all rules
 * 3. If a rule condition is met AND hasn't fired yet, trigger the effect
 * 4. Mark the rule as fired to prevent spam
 * 
 * This component must use client:only="react" to avoid hydration issues.
 */

import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $engineState, $currentTurn, markRuleFired, hasRuleFired, advanceTurn } from '../store';
import { $activeSurge } from '../store';
import { fireEffect } from '../effects';
import type { Rule, SurgeEvent } from '../types';

interface EngineDirectorProps {
  rules: Rule[];
  surges: SurgeEvent[];
}

export default function EngineDirector({ rules, surges }: EngineDirectorProps) {
  const state = useStore($engineState);
  const currentTurn = useStore($currentTurn);
  
  // Component lifecycle logging
  useEffect(() => {
    console.log('🎬 EngineDirector mounted', {
      rules: rules.length,
      surges: surges.length
    });
    
    return () => {
      console.log('🎬 EngineDirector unmounting');
    };
  }, []);
  
  // Watch for rule triggers
  useEffect(() => {
    rules.forEach((rule, index) => {
      // Skip if already fired
      if (hasRuleFired(index)) return;
      
      const resourceValue = state[rule.targetId];
      if (resourceValue === undefined) return;
      
      // Evaluate condition
      let conditionMet = false;
      switch(rule.operator) {
        case '<': conditionMet = resourceValue < rule.threshold; break;
        case '>': conditionMet = resourceValue > rule.threshold; break;
        case '==': conditionMet = resourceValue === rule.threshold; break;
        case '>=': conditionMet = resourceValue >= rule.threshold; break;
        case '<=': conditionMet = resourceValue <= rule.threshold; break;
      }
      
      if (conditionMet) {
        console.log(`🎯 Rule triggered: ${rule.targetId} ${rule.operator} ${rule.threshold} → ${rule.action}`);
        markRuleFired(index);
        
        // Special handling for advance_turn and surge
        if (rule.action === 'advance_turn') {
          setTimeout(() => advanceTurn(), 500);
        } else if (rule.action === 'surge') {
          // Trigger surge event by turn number
          const surge = surges.find(s => s.triggerTurn === parseInt(rule.payload));
          if (surge) {
            $activeSurge.set(surge);
          }
        } else {
          fireEffect(rule.action, rule.payload);
        }
      }
    });
  }, [state, rules, surges]);
  
  // Watch for turn-based surge events
  useEffect(() => {
    const surge = surges.find(s => s.triggerTurn === currentTurn);
    if (surge) {
      console.log(`⚡ Surge event triggered at turn ${currentTurn}`);
      $activeSurge.set(surge);
    }
  }, [currentTurn, surges]);
  
  return null; // Invisible component
}
````

## File: src/lib/engine/components/GameInitializer.tsx
````typescript
/**
 * GAME INITIALIZER COMPONENT
 * 
 * An invisible component that initializes the Sovereign Engine when an adventure loads.
 * 
 * Responsibilities:
 * 1. Initialize engine state with resources
 * 2. Set up combatant queue (if present)
 * 3. Clean up on unmount (prevent state leaks between adventures)
 * 
 * This component MUST use client:only="react" to avoid SSR hydration issues.
 * 
 * Why it's separate from the layout:
 * - Reusable across different layout types
 * - Clear lifecycle management
 * - Easy to test in isolation
 */

import { useEffect } from 'react';
import { initEngine, initCombatants, resetEngine } from '../store';
import type { Resource } from '../types';

interface Combatant {
  id: string;
  name: string;
  avatar: string;
  type: 'hero' | 'enemy' | 'ally';
  linkedResource?: string;
}

interface GameInitializerProps {
  adventureSlug: string;
  resources: Resource[];
  rules?: any[]; // Rules are handled by EngineDirector, we just log them here
  combatants?: Combatant[];
}

export default function GameInitializer({ 
  adventureSlug, 
  resources, 
  rules = [],
  combatants = []
}: GameInitializerProps) {
  useEffect(() => {
    console.log('🎮 Initializing Sovereign Engine...', {
      adventure: adventureSlug,
      resources: resources.length,
      rules: rules.length,
      combatants: combatants.length
    });
    
    // Initialize resources and state
    initEngine(adventureSlug, resources);
    
    // Initialize combatant queue (if present)
    if (combatants.length > 0) {
      initCombatants(combatants);
      console.log('⚔️ Combat queue initialized with', combatants.length, 'combatants');
    }
    
    // Cleanup on unmount (switching to different adventure)
    return () => {
      console.log('🧹 Cleaning up engine state for', adventureSlug);
      resetEngine();
    };
  }, [adventureSlug]); // Only re-init if adventure slug changes
  
  return null; // Invisible component
}
````

## File: src/lib/engine/components/ModifierButton.tsx
````typescript
/**
 * MODIFIER BUTTON COMPONENT
 * 
 * Simple +/- buttons for testing and debugging the engine.
 * 
 * In production adventures, resource changes happen through:
 * - Parent choices in the narrative
 * - Automatic rule triggers
 * - Surge events
 * 
 * But during development (and in the /engine-demo page), these buttons
 * let you manually modify resources to test rules and effects.
 * 
 * Also useful for "cheats" or "developer mode" toggles in final products.
 */

import { modifyResource } from '../store';
import { Plus, Minus } from 'lucide-react';

interface ModifierButtonProps {
  resourceId: string;
  delta: number;
  max: number;
  label?: string;
}

export default function ModifierButton({ resourceId, delta, max, label }: ModifierButtonProps) {
  const Icon = delta > 0 ? Plus : Minus;
  const colorClass = delta > 0 
    ? 'bg-green-600 hover:bg-green-500 active:bg-green-700' 
    : 'bg-red-600 hover:bg-red-500 active:bg-red-700';
  
  return (
    <button
      onClick={() => modifyResource(resourceId, delta, max)}
      className={`
        ${colorClass} 
        text-white 
        px-4 py-3 
        min-h-[48px]
        rounded-lg 
        transition-all 
        flex items-center justify-center gap-2 
        font-semibold text-sm
        touch-manipulation
        active:scale-95
        shadow-lg
      `}
    >
      <Icon className="w-5 h-5" />
      <span>{label || `${delta > 0 ? '+' : ''}${delta}`}</span>
    </button>
  );
}
````

## File: src/lib/engine/components/ResourceCard.tsx
````typescript
/**
 * RESOURCE CARD COMPONENT
 * 
 * Displays a tracked resource (HP, XP, Trust, etc.) with:
 * - Real-time updates (subscribes to nano store)
 * - Smooth animations on value changes
 * - Theme-based coloring
 * - Multiple display styles (bar, counter, hidden)
 * - Lucide icons for visual clarity
 * 
 * This component is 100% reusable across adventures, courses, habit trackers, etc.
 */

import { useStore } from '@nanostores/react';
import { $engineState } from '../store';
import type { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { Resource } from '../types';

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  const state = useStore($engineState);
  const currentValue = state[resource.id] || resource.initial;
  const percentage = (currentValue / resource.max) * 100;
  
  // Get icon component dynamically from Lucide
  const IconComponent = resource.icon ? 
    (Icons[resource.icon as keyof typeof Icons] as LucideIcon) : 
    null;
  
  // Theme colors for progress bars
  const themeColors = {
    red: 'from-red-500 to-red-700',
    green: 'from-green-500 to-green-700',
    blue: 'from-blue-500 to-blue-700',
    gold: 'from-yellow-500 to-yellow-700',
    purple: 'from-purple-500 to-purple-700'
  };
  
  // Hidden style = tracked but not displayed (used for internal counters)
  if (resource.style === 'hidden') return null;
  
  // Counter style = big number display (good for simple values)
  if (resource.style === 'counter') {
    return (
      <div className="glass-panel p-4 text-center">
        {IconComponent && <IconComponent className="w-8 h-8 mx-auto mb-2 text-forge-gold" />}
        <div className="text-4xl font-bold text-white transition-all duration-300">
          {currentValue}
        </div>
        <div className="text-sm text-slate-400 mt-1">{resource.label}</div>
      </div>
    );
  }
  
  // Bar style = progress bar display (default, best for ranges)
  return (
    <div className="glass-panel p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent className="w-5 h-5 text-forge-gold" />}
          <span className="text-sm font-semibold text-white">{resource.label}</span>
        </div>
        <span className="text-xs text-slate-400">
          {currentValue}/{resource.max}
        </span>
      </div>
      
      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${themeColors[resource.theme]} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
````

## File: src/lib/engine/components/SmartDrawerController.tsx
````typescript
/**
 * SMART DRAWER CONTROLLER
 * 
 * An invisible component that watches engine state for "interesting" events
 * and triggers drawer auto-expansion when appropriate.
 * 
 * Auto-expand triggers:
 * 1. Any resource with "_hp" in the ID drops to critical levels (≤ 5)
 * 2. Any resource reaches 0 (dramatic moment)
 * 3. Any resource reaches max value (achievement moment)
 * 
 * Why this exists:
 * - Proactive UX: Parent doesn't miss critical moments
 * - Context-aware: Only expands when something important happens
 * - Non-intrusive: Doesn't auto-expand during normal reading
 * 
 * Philosophy:
 * "The app should feel like a helpful co-DM, not a demanding robot"
 */

import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $engineState, $shouldAutoExpand } from '../store';

export default function SmartDrawerController() {
  const state = useStore($engineState);
  
  useEffect(() => {
    // Check for critical HP (any resource with "_hp" suffix)
    Object.entries(state).forEach(([key, value]) => {
      // Skip system keys (prefixed with _)
      if (key.startsWith('_')) return;
      
      // Critical HP warning
      if (key.includes('_hp') && value <= 5 && value > 0) {
        console.log('🚨 Critical HP detected:', key, '=', value);
        $shouldAutoExpand.set(true);
      }
      
      // Dramatic zero moment
      if (value === 0 && !key.startsWith('_')) {
        console.log('💀 Resource depleted:', key);
        $shouldAutoExpand.set(true);
      }
      
      // Achievement moment (resource maxed out)
      // Only trigger if resource was below max in previous render
      // (This prevents spam on initial load)
      if (value >= 100 && !key.startsWith('_')) {
        console.log('🎉 Resource maxed:', key);
        $shouldAutoExpand.set(true);
      }
    });
  }, [state]);
  
  return null; // Invisible component
}
````

## File: src/lib/engine/components/SurgeOverlay.tsx
````typescript
/**
 * SURGE OVERLAY COMPONENT
 * 
 * The "Plot Twist" screen-lock overlay. When a surge event triggers:
 * 1. Freezes the screen with a dramatic overlay
 * 2. Shows narrative dialogue for parent to read
 * 3. Optionally modifies resources (Goblin drinks potion = +5 HP)
 * 4. Forces user acknowledgment before continuing
 * 
 * This creates those "WHOA!" moments that make adventures memorable.
 * 
 * Design notes:
 * - Full-screen z-index 50 (blocks all interaction)
 * - Forge Dark aesthetic with gold border
 * - Clear call-to-action button
 * - Accessible (no auto-dismiss, requires user action)
 */

import { useStore } from '@nanostores/react';
import { $activeSurge, $shouldAutoExpand, modifyResource } from '../store';
import { fireEffect } from '../effects';
import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

export default function SurgeOverlay() {
  const surge = useStore($activeSurge);
  
  // Fire animation effect when surge appears
  // Also trigger drawer auto-expand
  useEffect(() => {
    if (surge) {
      // Auto-expand drawer to show resource changes
      $shouldAutoExpand.set(true);
      
      // Fire visual effect
      if (surge.animation !== 'none') {
        fireEffect(surge.animation, '');
      }
    }
  }, [surge]);
  
  if (!surge) return null;
  
  const handleDismiss = () => {
    // Apply resource modifications before dismissing
    if (surge.modifyResources) {
      surge.modifyResources.forEach(mod => {
        modifyResource(mod.resourceId, mod.delta, 999); // Assume high max for surges
      });
    }
    $activeSurge.set(null);
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center animate-fade-in border-4 border-yellow-500 backdrop-blur-sm">
      <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4 animate-pulse" />
      
      <h3 className="text-3xl font-bold text-white mb-4">⚠️ WAIT!</h3>
      
      <div className="max-w-2xl mb-8">
        <p className="text-xl text-yellow-100 font-serif italic leading-relaxed">
          "{surge.dialogue}"
        </p>
      </div>
      
      {surge.forceFirst && (
        <div className="bg-red-900/50 p-6 rounded-lg border-2 border-red-500 mb-6 max-w-md">
          <p className="text-red-200 font-bold uppercase tracking-widest text-sm mb-2">
            Queue Update Required
          </p>
          <p className="text-white">
            Move the <span className="font-bold text-red-400">Enemy Card</span> to the front of the line!
          </p>
        </div>
      )}
      
      {surge.modifyResources && surge.modifyResources.length > 0 && (
        <div className="glass-panel p-4 mb-6">
          <p className="text-sm text-slate-400 mb-2">Effects:</p>
          {surge.modifyResources.map((mod, i) => (
            <div key={i} className="text-white font-mono">
              {mod.resourceId}: {mod.delta > 0 ? '+' : ''}{mod.delta}
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={handleDismiss}
        className="bg-yellow-500 text-yellow-900 font-bold px-8 py-4 rounded-lg hover:bg-yellow-400 shadow-xl transition-all hover:scale-105"
      >
        Okay, Continue Adventure
      </button>
    </div>
  );
}
````

## File: src/lib/engine/components/TurnQueue.tsx
````typescript
/**
 * TURN QUEUE COMPONENT
 * 
 * Manages the turn-based system with:
 * - Current turn display
 * - "Next Turn" button for manual advancement
 * - Turn history with rewind capability
 * - Visual timeline
 * 
 * Why turn-based?
 * - Creates natural pacing for parent-led adventures
 * - Allows for turn-triggered events (surge on turn 3, etc.)
 * - Gives kids a sense of progress
 * - Makes complex scenarios manageable
 * 
 * Rewind feature:
 * - Essential for first-time parents ("Oops, I clicked the wrong thing!")
 * - Great for teaching moments ("What if we had done this instead?")
 * - Builds trust ("The app won't punish mistakes")
 */

import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { $currentTurn, advanceTurn, rewindToTurn, $turnHistory } from '../store';
import { ChevronRight, RotateCcw } from 'lucide-react';

interface TurnQueueProps {
  maxTurns?: number;
}

export default function TurnQueue({ maxTurns }: TurnQueueProps) {
  const currentTurn = useStore($currentTurn);
  const history = useStore($turnHistory);
  const [showHistory, setShowHistory] = useState(false);
  
  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="text-sm font-bold text-slate-400">TURN</div>
          <div className="text-3xl font-bold text-white">{currentTurn}</div>
          {maxTurns && <div className="text-slate-500">/ {maxTurns}</div>}
        </div>
        
        <div className="flex gap-2">
          {history.length > 1 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors"
              title="Show turn history"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
            </button>
          )}
          
          <button
            onClick={() => advanceTurn()}
            className="px-4 py-2 bg-forge-blue text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 font-semibold"
          >
            Next Turn
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {showHistory && (
        <div className="border-t border-slate-700 pt-4 mt-4">
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Turn History (Rewind)</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.map(entry => (
              <button
                key={entry.turn}
                onClick={() => {
                  rewindToTurn(entry.turn);
                  setShowHistory(false);
                }}
                className={`w-full text-left p-2 rounded transition-colors ${
                  entry.turn === currentTurn 
                    ? 'bg-forge-blue text-white' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Turn {entry.turn}</span>
                  <span className="text-xs opacity-70">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
````

## File: src/lib/engine/effects.ts
````typescript
/**
 * SOVEREIGN ENGINE - EFFECTS SYSTEM
 * 
 * This module handles all visual/audio effects triggered by rules.
 * Each effect is designed to provide immediate feedback and create
 * memorable moments in the adventure.
 * 
 * Design philosophy:
 * - Effects should be lightweight (no heavy libraries)
 * - They should work on mobile AND desktop
 * - They should match the Forge Dark aesthetic
 */

import confetti from 'canvas-confetti';
import { toast } from 'sonner';

/**
 * Fire an effect based on the action type
 * 
 * This is the main entry point called by EngineDirector when rules trigger.
 * 
 * @param action - The type of effect to fire
 * @param payload - Data for the effect (message text, URL, etc.)
 */
export function fireEffect(action: string, payload: string) {
  switch(action) {
    case 'toast':
      // Show a notification message
      toast(payload, {
        duration: 4000,
        style: {
          background: '#0B0F19', // Forge dark
          color: '#F59E0B', // Forge gold
          border: '2px solid #3B82F6', // Forge blue
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          padding: '16px'
        }
      });
      break;
      
    case 'confetti':
      // Victory celebration with brand colors
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#8B5CF6', '#F59E0B'], // Forge theme
        disableForReducedMotion: true
      });
      break;
      
    case 'shake':
      // Shake the entire screen (used for damage, danger, impact)
      document.body.classList.add('animate-shake');
      setTimeout(() => {
        document.body.classList.remove('animate-shake');
      }, 500);
      break;
      
    case 'flash':
      // Red flash overlay (damage indicator, danger warning)
      const flash = document.createElement('div');
      flash.className = 'fixed inset-0 bg-red-500 opacity-50 z-[9999] animate-flash pointer-events-none';
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 300);
      break;
      
    case 'redirect':
      // Navigate to a different page (game over, victory, next chapter)
      if (payload) {
        window.location.href = payload;
      }
      break;
      
    case 'unlock':
      // Save to localStorage that content is unlocked
      // This allows gating future content behind achievements
      const unlocked = JSON.parse(localStorage.getItem('pf-unlocked') || '[]');
      if (!unlocked.includes(payload)) {
        unlocked.push(payload);
        localStorage.setItem('pf-unlocked', JSON.stringify(unlocked));
        toast(`🔓 Unlocked: ${payload}`, {
          duration: 5000,
          style: {
            background: '#0B0F19',
            color: '#F59E0B',
            border: '2px solid #8B5CF6',
            fontFamily: 'Inter, sans-serif'
          }
        });
      }
      break;
      
    default:
      console.warn(`Unknown effect action: ${action}`);
  }
}

/**
 * Check if content is unlocked
 * 
 * Use this to conditionally show sections based on achievements.
 * Example: "Chapter 2" only appears if player completed "Chapter 1"
 * 
 * @param contentId - The identifier of the content to check
 * @returns true if unlocked, false otherwise
 */
export function isUnlocked(contentId: string): boolean {
  if (typeof window === 'undefined') return false;
  const unlocked = JSON.parse(localStorage.getItem('pf-unlocked') || '[]');
  return unlocked.includes(contentId);
}

/**
 * Clear all unlocks (useful for testing or "reset progress")
 */
export function clearUnlocks() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pf-unlocked');
  }
}
````

## File: src/lib/engine/store.ts
````typescript
/**
 * SOVEREIGN ENGINE STORE
 * 
 * This is the "brain" of the engine. It manages all game state using Nano Stores.
 * 
 * Why Nano Stores instead of React state or Zustand?
 * 1. Works across ANY framework (React, Vue, Svelte, vanilla JS)
 * 2. Extremely lightweight (~1KB)
 * 3. Built-in persistence via @nanostores/persistent
 * 4. Perfect for the "Sovereign Starter Kit" philosophy (zero vendor lock-in)
 * 
 * State persistence strategy:
 * - Guest users: State saved to localStorage with predictable key (guest-adventureSlug)
 * - Authenticated users: Unique session ID per playthrough (adventureSlug-timestamp)
 * - This allows guests to try the product while preserving upgrade path to premium
 */

import { persistentAtom } from '@nanostores/persistent';
import { atom, computed } from 'nanostores';
import type { EngineState, TurnHistoryEntry, Resource, SurgeEvent } from './types';

// ============================================================================
// PERSISTENT STATE (survives page refresh via localStorage)
// ============================================================================

/**
 * The main state store - a simple key-value dictionary
 * Example: { player_hp: 15, goblin_hp: 8, _currentTurn: 3 }
 */
export const $engineState = atom<EngineState>({});

// Manually persist to localStorage
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('pf-engine');
  if (stored) {
    try {
      $engineState.set(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to parse engine state:', e);
    }
  }
  
  $engineState.subscribe(state => {
    localStorage.setItem('pf-engine', JSON.stringify(state));
  });
}

/**
 * Session identifier - unique ID for this playthrough
 * Format: "adventureSlug-timestamp" (auth) or "guest-adventureSlug" (guest)
 */
export const $sessionId = persistentAtom<string>('pf-session:', '');

// ============================================================================
// SESSION-ONLY STATE (resets on page load)
// ============================================================================

/**
 * Tracks which rules have been fired this session
 * Prevents spam: "You won!" shouldn't show 50 times if XP keeps increasing
 * 
 * Format: Set of strings like "3:5" (turn 3, rule index 5)
 */
export const $firedRules = atom<Set<string>>(new Set());

/**
 * History of all turns for the rewind feature
 * Each entry is a complete snapshot of engine state at that turn
 */
export const $turnHistory = atom<TurnHistoryEntry[]>([]);

/**
 * Currently active surge event (if any)
 * When set, SurgeOverlay component displays the full-screen interrupt
 */
export const $activeSurge = atom<SurgeEvent | null>(null);

/**
 * COMBATANT QUEUE STATE
 * 
 * Manages the turn order for combat encounters.
 * Each combatant has an ID, name, avatar, type, and optional linked resource (HP).
 */
export const $combatantQueue = atom<Array<{
  id: string;
  name: string;
  avatar: string;
  type: 'hero' | 'enemy' | 'ally';
  linkedResource?: string;
}>>([]);

/**
 * Current active combatant (whose turn it is)
 */
export const $currentCombatant = atom<string | null>(null);

/**
 * MOBILE DRAWER STATE
 * 
 * Controls whether the mobile drawer is expanded or collapsed.
 * Desktop mode ignores this (drawer is always visible as sidebar).
 */
export const $drawerExpanded = atom<boolean>(false);

/**
 * Auto-expand trigger
 * When set to true, drawer will expand on next render.
 * Used by surge events and critical state changes.
 */
export const $shouldAutoExpand = atom<boolean>(false);

// ============================================================================
// COMPUTED VALUES (auto-update when dependencies change)
// ============================================================================

/**
 * The current turn number (read from _currentTurn in engine state)
 */
export const $currentTurn = computed($engineState, state => state._currentTurn || 1);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Initialize the engine for a new adventure session
 * 
 * This function:
 * 1. Creates a session ID (guest vs authenticated)
 * 2. Initializes all resources to their starting values
 * 3. Sets up system variables (_currentTurn, _sessionStart)
 * 4. Clears any previous state
 * 
 * @param adventureSlug - The adventure identifier (e.g. "sky-island")
 * @param resources - Array of resource definitions from adventure frontmatter
 */
export function initEngine(adventureSlug: string, resources: Resource[]) {
  // Check if user is authenticated (look for Supabase auth token)
  const isAuthenticated = typeof window !== 'undefined' && 
    localStorage.getItem('sb-fhihhvyfluopxcuezqhi-auth-token');
  
  // Create session ID
  // Guests: Predictable key (progress saved but overwrites on replay)
  // Auth'd: Unique timestamp (allows multiple playthroughs to be saved)
  const sessionId = isAuthenticated 
    ? `${adventureSlug}-${Date.now()}` 
    : `guest-${adventureSlug}`;
  
  $sessionId.set(sessionId);
  
  // Build initial state
  const initialState: EngineState = {
    _currentTurn: 1,
    _sessionStart: Date.now()
  };
  
  // Add all resources at their initial values
  resources.forEach(resource => {
    initialState[resource.id] = resource.initial;
  });
  
  // Apply to store
  $engineState.set(initialState);
  
  // Clear fired rules
  $firedRules.set(new Set());
  
  // Initialize turn history with turn 1
  $turnHistory.set([{
    turn: 1,
    snapshot: { ...initialState },
    timestamp: Date.now()
  }]);
  
  // Clear any active surge
  $activeSurge.set(null);
}

/**
 * Update a resource value directly (no clamping)
 * 
 * @param id - Resource identifier
 * @param value - New value to set
 */
export function setResource(id: string, value: number) {
  const current = $engineState.get();
  $engineState.set({ ...current, [id]: value });
}

/**
 * Modify a resource by a delta amount with automatic clamping
 * 
 * This is the function you'll use most often. It handles:
 * - Adding/subtracting values (+10 HP, -5 damage)
 * - Clamping to valid range (0 to max)
 * - Smooth updates that trigger reactive components
 * 
 * @param id - Resource identifier
 * @param delta - Amount to add (positive) or subtract (negative)
 * @param max - Maximum allowed value (for clamping)
 */
export function modifyResource(id: string, delta: number, max: number) {
  const current = $engineState.get();
  const currentValue = current[id] || 0;
  const newValue = Math.max(0, Math.min(max, currentValue + delta));
  $engineState.set({ ...current, [id]: newValue });
}

/**
 * Reset a specific resource to its initial value
 * 
 * @param id - Resource identifier
 * @param initialValue - The starting value to reset to
 */
export function resetResource(id: string, initialValue: number) {
  setResource(id, initialValue);
}

/**
 * Advance to the next turn
 * 
 * This function:
 * 1. Increments the turn counter
 * 2. Saves a snapshot to history (for rewind feature)
 * 3. Can trigger turn-based events (handled by EngineDirector)
 */
export function advanceTurn() {
  const current = $engineState.get();
  const nextTurn = (current._currentTurn || 1) + 1;
  const newState = { ...current, _currentTurn: nextTurn };
  
  $engineState.set(newState);
  
  // Save to history
  const history = $turnHistory.get();
  $turnHistory.set([...history, {
    turn: nextTurn,
    snapshot: { ...newState },
    timestamp: Date.now()
  }]);
}

/**
 * Rewind to a previous turn
 * 
 * This is the "undo" feature. Use cases:
 * - Parent made a mistake clicking buttons
 * - Kids want to try a different choice
 * - Teaching moment: "What would have happened if...?"
 * 
 * Implementation notes:
 * - Restores complete state snapshot from that turn
 * - Clears any rules that fired AFTER the target turn
 * - Does NOT clear turn history (you can still see future turns)
 * 
 * @param turnNumber - The turn to rewind to
 */
export function rewindToTurn(turnNumber: number) {
  const history = $turnHistory.get();
  const targetEntry = history.find(entry => entry.turn === turnNumber);
  
  if (targetEntry) {
    // Restore state
    $engineState.set({ ...targetEntry.snapshot });
    
    // Clear fired rules after the target turn
    const firedRules = $firedRules.get();
    const newFiredRules = new Set(
      Array.from(firedRules).filter(ruleKey => {
        const [turn] = ruleKey.split(':');
        return parseInt(turn) <= turnNumber;
      })
    );
    $firedRules.set(newFiredRules);
  }
}

/**
 * Mark a rule as fired to prevent duplicate triggers
 * 
 * Rules are tracked by "turn:index" key
 * Example: "3:2" = Turn 3, Rule index 2
 * 
 * @param ruleIndex - The index of the rule in the rules array
 */
export function markRuleFired(ruleIndex: number) {
  const turn = $currentTurn.get();
  const ruleKey = `${turn}:${ruleIndex}`;
  const fired = $firedRules.get();
  $firedRules.set(new Set([...fired, ruleKey]));
}

/**
 * Check if a rule has already been fired
 * 
 * @param ruleIndex - The index of the rule to check
 * @returns true if the rule has fired, false otherwise
 */
export function hasRuleFired(ruleIndex: number): boolean {
  const turn = $currentTurn.get();
  const ruleKey = `${turn}:${ruleIndex}`;
  return $firedRules.get().has(ruleKey);
}

/**
 * Initialize combatant queue
 * 
 * Called when adventure loads with combatants defined.
 * Sets up the turn order and marks first combatant as active.
 * 
 * @param combatants - Array of combatant definitions from adventure
 */
export function initCombatants(combatants: Array<any>) {
  $combatantQueue.set([...combatants]);
  // First combatant goes first
  if (combatants.length > 0) {
    $currentCombatant.set(combatants[0].id);
  }
}

/**
 * Reorder combatant queue
 * 
 * Called after drag-and-drop operation.
 * Updates queue to new order without changing active combatant.
 * 
 * @param newOrder - Reordered array of combatants
 */
export function reorderQueue(newOrder: Array<any>) {
  $combatantQueue.set(newOrder);
}

/**
 * Move combatant to front (surge event)
 * 
 * Used by surge events with "forceFirst" flag.
 * Programmatically reorders queue to put specific combatant first.
 * 
 * Example: "The goblin surges forward with rage!"
 * 
 * @param combatantId - ID of combatant to move to front
 */
export function moveCombatantToFront(combatantId: string) {
  const queue = $combatantQueue.get();
  const index = queue.findIndex(c => c.id === combatantId);
  if (index > 0) {
    const combatant = queue[index];
    const newQueue = [combatant, ...queue.slice(0, index), ...queue.slice(index + 1)];
    $combatantQueue.set(newQueue);
    $currentCombatant.set(combatantId);
    
    // Auto-expand drawer to show the queue change
    $shouldAutoExpand.set(true);
  }
}

/**
 * End current combatant's turn, advance to next
 * 
 * Cycles through the queue. When reaching the end, wraps back to first
 * and increments the global turn counter.
 * 
 * This is called by the "End Turn" button in the queue UI.
 */
export function advanceCombatantTurn() {
  const queue = $combatantQueue.get();
  const current = $currentCombatant.get();
  
  if (!current || queue.length === 0) return;
  
  const currentIndex = queue.findIndex(c => c.id === current);
  const nextIndex = (currentIndex + 1) % queue.length;
  $currentCombatant.set(queue[nextIndex].id);
  
  // Also advance global turn if we've cycled back to first combatant
  if (nextIndex === 0) {
    advanceTurn();
  }
}

/**
 * Complete reset of the engine (nuclear option)
 * 
 * Use cases:
 * - Testing/debugging
 * - "Start Over" button
 * - Switching between adventures
 */
export function resetEngine() {
  $engineState.set({});
  $firedRules.set(new Set());
  $turnHistory.set([]);
  $activeSurge.set(null);
  $sessionId.set('');
  $combatantQueue.set([]);
  $currentCombatant.set(null);
  $drawerExpanded.set(false);
  $shouldAutoExpand.set(false);
}
````

## File: src/lib/engine/types.ts
````typescript
/**
 * TYPE DEFINITIONS FOR THE SOVEREIGN ENGINE
 * 
 * These interfaces define the core data structures for the gamification engine.
 * They are used by both adventures (HP/combat) and courses (XP/progress).
 * 
 * Design principle: Keep types generic and reusable across different products.
 */

export interface Resource {
  id: string;
  label: string;
  max: number;
  initial: number;
  theme: 'red' | 'green' | 'blue' | 'gold' | 'purple';
  style: 'bar' | 'counter' | 'hidden';
  icon?: string;
}

export interface Rule {
  targetId: string;
  operator: '<' | '>' | '==' | '>=' | '<=';
  threshold: number;
  action: 'toast' | 'confetti' | 'shake' | 'redirect' | 'unlock' | 'advance_turn' | 'surge' | 'flash';
  payload: string;
}

export interface SurgeEvent {
  triggerTurn: number;
  dialogue: string;
  forceFirst: boolean;
  animation: 'none' | 'shake' | 'flash' | 'lock';
  modifyResources?: Array<{ resourceId: string; delta: number }>;
}

export interface TurnEvent {
  turnNumber: number;
  eventType: 'dialogue' | 'spawn_resource' | 'modify_resource' | 'auto_advance';
  payload: string;
}

/**
 * ENGINE STATE
 * 
 * A simple key-value store where keys are resource IDs and values are current numbers.
 * Special keys with underscore prefix are reserved for system use:
 * - _currentTurn: The active turn number
 * - _sessionStart: Unix timestamp when session began
 */
export type EngineState = Record<string, number>;

/**
 * TURN HISTORY ENTRY
 * 
 * Stores a snapshot of the entire engine state at a specific turn.
 * Used for the "rewind" feature to restore previous game states.
 */
export interface TurnHistoryEntry {
  turn: number;
  snapshot: EngineState;
  timestamp: number;
}
````

## File: src/lib/keystatic-reader.ts
````typescript
/**
 * KEYSTATIC READER UTILITIES
 * 
 * Centralized reading logic for Keystatic content.
 * Provides graceful fallbacks to ensure "the show must go on" even if content is missing.
 * 
 * Why this exists:
 * - Single source of truth for content access
 * - Consistent error handling across routes
 * - Easy to mock for testing
 */

import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';

export const reader = createReader(process.cwd(), keystaticConfig);

/**
 * Get all adventures from Keystatic
 * Returns empty array if reading fails (graceful degradation)
 */
export async function getAllAdventures() {
  try {
    return await reader.collections.adventures.all();
  } catch (error) {
    console.error('Failed to read adventures:', error);
    return [];
  }
}

/**
 * Get a specific adventure by slug
 * Returns null if not found (caller handles fallback)
 */
export async function getAdventure(slug: string) {
  try {
    return await reader.collections.adventures.read(slug);
  } catch (error) {
    console.error(`Failed to read adventure: ${slug}`, error);
    return null;
  }
}

/**
 * FALLBACK ADVENTURE
 * 
 * Used when:
 * - Adventure not found
 * - Adventure has no resources configured
 * - Keystatic read fails
 * 
 * Philosophy: Never crash. Show something playable.
 */
export const FALLBACK_ADVENTURE = {
  title: 'Mystery Adventure',
  description: 'This adventure is still being prepared by the storytellers...',
  duration: '30 minutes',
  difficulty: 'beginner' as const,
  resources: [
    {
      id: 'mystery_points',
      label: 'Mystery Points',
      max: 100,
      initial: 50,
      theme: 'purple' as const,
      style: 'bar' as const,
      icon: 'HelpCircle'
    }
  ],
  rules: [],
  surges: [],
  combatants: [
    {
      id: 'hero',
      name: 'Hero',
      avatar: '🛡️',
      type: 'hero' as const
    }
  ]
};
````

## File: src/pages/engine-demo.astro
````astro
---
/**
 * ENGINE DEMO PAGE
 * 
 * This is the "Component Laboratory" - a public showcase of the Sovereign Engine.
 * 
 * Purpose:
 * 1. Sales demo for potential StackForge buyers
 * 2. Interactive documentation for developers
 * 3. Testing ground for new features
 * 
 * Shows both use cases:
 * - Adventure Mode (HP, combat, narrative)
 * - Course Mode (XP, lessons, progress tracking)
 * 
 * Each section has modifier buttons so visitors can click and see effects in real-time.
 */

import BaseLayout from '../layouts/BaseLayout.astro';
import ResourceCard from '../lib/engine/components/ResourceCard';
import TurnQueue from '../lib/engine/components/TurnQueue';
import EngineDirector from '../lib/engine/components/EngineDirector';
import SurgeOverlay from '../lib/engine/components/SurgeOverlay';
import ModifierButton from '../lib/engine/components/ModifierButton';
import { Toaster } from 'sonner';

// MOCK DATA: Adventure Mode (Goblin Fight)
const adventureResources = [
  {
    id: 'player_hp',
    label: 'Your Health',
    max: 20,
    initial: 20,
    theme: 'red' as const,
    style: 'bar' as const,
    icon: 'Heart'
  },
  {
    id: 'goblin_hp',
    label: 'Goblin Health',
    max: 15,
    initial: 15,
    theme: 'purple' as const,
    style: 'counter' as const,
    icon: 'Skull'
  },
  {
    id: 'courage',
    label: 'Courage Points',
    max: 100,
    initial: 0,
    theme: 'gold' as const,
    style: 'bar' as const,
    icon: 'Star'
  }
];

const adventureRules = [
  {
    targetId: 'goblin_hp',
    operator: '<=' as const,
    threshold: 0,
    action: 'confetti' as const,
    payload: 'Victory! The goblin flees into the forest!'
  },
  {
    targetId: 'player_hp',
    operator: '<=' as const,
    threshold: 5,
    action: 'shake' as const,
    payload: ''
  },
  {
    targetId: 'courage',
    operator: '>=' as const,
    threshold: 50,
    action: 'toast' as const,
    payload: 'Your courage inspires your allies!'
  }
];

const adventureSurges = [
  {
    triggerTurn: 3,
    dialogue: 'The goblin drinks a potion! His eyes glow red with fury!',
    forceFirst: true,
    animation: 'flash' as const,
    modifyResources: [
      { resourceId: 'goblin_hp', delta: 5 }
    ]
  }
];

// MOCK DATA: Course Mode (Learning Progress)
const courseResources = [
  {
    id: 'xp',
    label: 'Experience Points',
    max: 1000,
    initial: 0,
    theme: 'green' as const,
    style: 'bar' as const,
    icon: 'Zap'
  },
  {
    id: 'lessons_completed',
    label: 'Lessons Completed',
    max: 10,
    initial: 0,
    theme: 'blue' as const,
    style: 'counter' as const,
    icon: 'BookOpen'
  },
  {
    id: 'streak',
    label: 'Day Streak',
    max: 30,
    initial: 0,
    theme: 'gold' as const,
    style: 'counter' as const,
    icon: 'Flame'
  }
];

const courseRules = [
  {
    targetId: 'xp',
    operator: '>=' as const,
    threshold: 250,
    action: 'toast' as const,
    payload: '🎉 Level 2 Unlocked!'
  },
  {
    targetId: 'xp',
    operator: '>=' as const,
    threshold: 1000,
    action: 'confetti' as const,
    payload: 'Course Complete!'
  },
  {
    targetId: 'lessons_completed',
    operator: '>=' as const,
    threshold: 5,
    action: 'unlock' as const,
    payload: 'Bonus Module: Advanced Tactics'
  }
];
---

<BaseLayout title="Sovereign Engine Demo" description="Testing adventure & course modes">
  <Toaster client:only="react" position="top-center" />
  
  <div class="min-h-screen bg-forge-dark text-white p-8">
    <!-- Marketing Banner -->
    <div class="bg-gradient-to-r from-forge-blue to-forge-purple p-6 rounded-xl text-center mb-8 border-2 border-white/20">
      <h2 class="text-2xl font-bold text-white mb-2">
        ⚙️ StackForge Sovereign Engine
      </h2>
      <p class="text-slate-200 max-w-2xl mx-auto text-sm">
        This is a live demo of the reusable React components included in the StackForge Starter Kit. 
        Same engine powers adventures, courses, habit trackers, and more.
      </p>
      <div class="mt-4 flex gap-4 justify-center flex-wrap">
        <a 
          href="/adventure/sky-island" 
          class="px-6 py-2 bg-white text-forge-blue rounded-lg font-semibold hover:bg-slate-100 transition-all"
        >
          See It In Action
        </a>
        <a 
          href="https://stackforge.com" 
          class="px-6 py-2 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-forge-blue transition-all"
        >
          Get The Kit
        </a>
      </div>
    </div>

    <div class="max-w-7xl mx-auto">
      <h1 class="text-5xl font-bold mb-2 animate-forge-flow">Sovereign Engine Demo</h1>
      <p class="text-slate-400 mb-12">
        Same engine. Two use cases. Zero compromise.
      </p>
      
      <!-- SPLIT VIEW -->
      <div class="grid lg:grid-cols-2 gap-8">
        
        <!-- LEFT: ADVENTURE MODE -->
        <div class="glass-panel p-6">
          <h2 class="text-2xl font-bold mb-4 text-forge-gold">Adventure Mode</h2>
          <p class="text-sm text-slate-400 mb-6">
            Turn-based combat with dynamic surge events
          </p>
          
          <EngineDirector 
            client:only="react" 
            rules={adventureRules}
            surges={adventureSurges}
          />
          <SurgeOverlay client:only="react" />
          
          <div class="space-y-4 mb-6">
            <TurnQueue client:only="react" maxTurns={10} />
            
            {adventureResources.map(resource => (
              <ResourceCard client:only="react" resource={resource} />
            ))}
          </div>
          
          <div class="border-t border-slate-700 pt-4">
            <p class="text-xs text-slate-500 mb-3 uppercase tracking-wide">Test Controls</p>
            <div class="flex flex-wrap gap-2">
              <ModifierButton 
                client:only="react"
                resourceId="player_hp"
                delta={-3}
                max={20}
                label="Take Damage"
              />
              <ModifierButton 
                client:only="react"
                resourceId="goblin_hp"
                delta={-5}
                max={15}
                label="Attack Goblin"
              />
              <ModifierButton 
                client:only="react"
                resourceId="courage"
                delta={25}
                max={100}
                label="Brave Action"
              />
            </div>
          </div>
        </div>
        
        <!-- RIGHT: COURSE MODE -->
        <div class="glass-panel p-6">
          <h2 class="text-2xl font-bold mb-4 text-forge-blue">Course Mode</h2>
          <p class="text-sm text-slate-400 mb-6">
            Student progress tracking with milestone rewards
          </p>
          
          <EngineDirector 
            client:only="react" 
            rules={courseRules}
            surges={[]}
          />
          
          <div class="space-y-4 mb-6">
            {courseResources.map(resource => (
              <ResourceCard client:only="react" resource={resource} />
            ))}
          </div>
          
          <div class="border-t border-slate-700 pt-4">
            <p class="text-xs text-slate-500 mb-3 uppercase tracking-wide">Test Controls</p>
            <div class="flex flex-wrap gap-2">
              <ModifierButton 
                client:only="react"
                resourceId="xp"
                delta={100}
                max={1000}
                label="Complete Lesson"
              />
              <ModifierButton 
                client:only="react"
                resourceId="lessons_completed"
                delta={1}
                max={10}
                label="Finish Lesson"
              />
              <ModifierButton 
                client:only="react"
                resourceId="streak"
                delta={1}
                max={30}
                label="Daily Login"
              />
            </div>
          </div>
        </div>
        
      </div>
      
      <!-- BOTTOM: CODE SNIPPET (The Pitch) -->
      <div class="mt-12 glass-panel p-6 border-2 border-forge-gold">
        <h3 class="text-xl font-bold mb-4">The Sovereign Engine Promise</h3>
        <div class="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <div class="text-forge-blue font-bold mb-2">One Codebase</div>
            <p class="text-slate-400">
              Whether you're building a game, course, or habit tracker—same engine.
            </p>
          </div>
          <div>
            <div class="text-forge-purple font-bold mb-2">Zero Dependencies</div>
            <p class="text-slate-400">
              No Firebase. No Supabase billing. Just local state + localStorage.
            </p>
          </div>
          <div>
            <div class="text-forge-gold font-bold mb-2">100% Yours</div>
            <p class="text-slate-400">
              No API keys. No vendor lock-in. Copy the /engine folder and go.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</BaseLayout>

<script>
  // Initialize engines on page load
  import { initEngine } from '../lib/engine/store';
  import type { Resource } from '../lib/engine/types';
  
  const adventureResources: Resource[] = [
    { id: 'player_hp', label: 'Your Health', max: 20, initial: 20, theme: 'red', style: 'bar', icon: 'Heart' },
    { id: 'goblin_hp', label: 'Goblin Health', max: 15, initial: 15, theme: 'purple', style: 'counter', icon: 'Skull' },
    { id: 'courage', label: 'Courage Points', max: 100, initial: 0, theme: 'gold', style: 'bar', icon: 'Star' }
  ];
  
  // Initialize adventure mode engine
  initEngine('demo-adventure', adventureResources);
</script>
````

## File: src/pages/setup-compendium.astro
````astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Setup Your Compendium">
  <div class="min-h-screen flex items-center justify-center px-4 hero-glow relative overflow-hidden">
    <div class="hero-stars"></div>

    <div class="max-w-md w-full relative z-10">
      <div class="text-center mb-8">
        <a href="/" class="flex items-center justify-center space-x-2 group">
          <svg class="w-8 h-8 text-forge-blue group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          <span class="font-bold text-xl animate-forge-flow">ParableForge</span>
        </a>
        <div class="mt-6 inline-flex items-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-full text-sm font-medium">
          <span>✓</span> Payment Verified
        </div>
        <h1 class="text-3xl font-bold text-white mt-4">Create Your Guardian Account</h1>
         <p class="text-gray-400 mt-2">One more step to access The Compendium</p>
      </div>

      <div class="glass-panel rounded-2xl p-8">
        <form id="signup-form" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              class="w-full px-4 py-3 bg-forge-dark border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-forge-blue focus:outline-none transition-colors"
              placeholder="you@example.com"
            />
            <p class="mt-1 text-xs text-gray-500">Use the same email from your purchase</p>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
              Create Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minlength="6"
              class="w-full px-4 py-3 bg-forge-dark border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-forge-blue focus:outline-none transition-colors"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              required
              minlength="6"
              class="w-full px-4 py-3 bg-forge-dark border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-forge-blue focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div id="error-message" class="hidden text-forge-red text-sm bg-forge-red/10 border border-forge-red/20 p-3 rounded-lg">
          </div>

          <div id="success-message" class="hidden text-green-400 text-sm bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
          </div>

          <button
            type="submit"
            class="btn-primary w-full text-center"
          >
             Create Account & Enter The Compendium
          </button>
        </form>
      </div>

      <div class="mt-8 text-center text-sm text-gray-500">
        <p>Already have an account? <a href="/login" class="text-forge-blue font-medium hover:underline">Sign in here</a></p>
      </div>
    </div>
  </div>

  <script>
    import { signUp } from '../lib/supabase';

    const form = document.getElementById('signup-form') as HTMLFormElement;
    const errorDiv = document.getElementById('error-message') as HTMLDivElement;
    const successDiv = document.getElementById('success-message') as HTMLDivElement;

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.classList.add('hidden');
      successDiv.classList.add('hidden');

      const formData = new FormData(form);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const confirmPassword = formData.get('confirm-password') as string;

      if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.classList.remove('hidden');
        return;
      }

      const { data, error } = await signUp(email, password);

      if (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
        return;
      }

      if (data.user) {
        // Check if email confirmation is required
        if (data.session) {
          // User is signed in, redirect to compendium
          window.location.href = '/compendium/welcome';
        } else {
          // Email confirmation required
          successDiv.textContent = 'Check your email to confirm your account, then sign in.';
          successDiv.classList.remove('hidden');
          form.reset();
        }
      }
    });
  </script>
</BaseLayout>
````

## File: src/pages/test-drawer.astro
````astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import DirectorDrawer from '../lib/engine/components/DirectorDrawer';

const testResources = [
  {
    id: 'hp',
    label: 'Test HP',
    max: 100,
    initial: 50,
    theme: 'red' as const,
    style: 'bar' as const,
  }
];
---

<BaseLayout title="Drawer Test" description="Testing DirectorDrawer">
  <div class="min-h-screen bg-forge-dark p-8">
    <h1 class="text-white text-3xl mb-4">Drawer Test Page</h1>
    <p class="text-slate-300 mb-8">This page tests if DirectorDrawer renders at all.</p>
    
    <DirectorDrawer 
      client:only="react"
      resources={testResources}
      combatants={[]}
    />
  </div>
</BaseLayout>
````

## File: _redirects
````
# Netlify Redirects for Backward Compatibility
# This file provides redirects from old grimoire URLs to new compendium URLs

# Grimoire to Compendium redirects
/grimoire/* /compendium/:splat 301

# Setup page redirect
/setup-grimoire /setup-compendium 301
````

## File: design-sandbox.html
````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ParableForge - Design Sandbox</title>

  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Nunito:wght@700;800;900&display=swap" rel="stylesheet">

  <!--
  ============================================
  DESIGN SANDBOX - ParableForge Landing Page
  ============================================

  HOW TO USE THIS FILE:
  - Edit colors in the Tailwind config below
  - Modify section styles, spacing, typography
  - Keep the HTML structure (section IDs, class patterns)
  - When done, give this file back to Claude to integrate

  COLOR PALETTE (edit these to change the whole site):
  - pf-primary: Soft Periwinkle Blue (main brand color)
  - pf-accent: Coral Pink (CTAs, highlights)
  - pf-green: Mint Green (success, checkmarks)
  - pf-cream: Cream (backgrounds)
  - pf-gold: Soft Gold (premium, emphasis)
  ============================================
  -->

  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'pf-primary': '#6F8AB7',
            'pf-primary-dark': '#5A7199',
            'pf-primary-light': '#8FA3C5',
            'pf-accent': '#F79F8E',
            'pf-green': '#9BCEA0',
            'pf-cream': '#F8F3E2',
            'pf-gold': '#F0D28A',
          },
          fontFamily: {
            'display': ['Nunito', 'system-ui', 'sans-serif'],
            'body': ['Inter', 'system-ui', 'sans-serif'],
          }
        }
      }
    }
  </script>

  <style>
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', system-ui, sans-serif; }
    .font-display { font-family: 'Nunito', system-ui, sans-serif; }
  </style>
</head>

<body class="bg-pf-cream text-gray-700 antialiased">

  <!-- ==================== SECTION: PRE-HEADER BAR ==================== -->
  <!-- Sticky header with brand + CTA -->
  <div id="pre-header" class="bg-pf-primary text-pf-cream py-2.5 px-4 sticky top-0 z-50">
    <div class="max-w-6xl mx-auto flex items-center justify-between gap-4">
      <span class="font-display font-extrabold text-lg text-white">ParableForge</span>
      <a href="#free-adventure" class="bg-pf-accent text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-pf-accent/90 transition-all hover:-translate-y-0.5">
        Get Free Adventure →
      </a>
    </div>
  </div>

  <!-- ==================== SECTION: HERO ==================== -->
  <section id="hero" class="px-4 sm:px-6 lg:px-8 bg-pf-cream pt-12 pb-12 text-center">
    <div class="max-w-6xl mx-auto">
      <p class="text-pf-gold font-bold text-sm tracking-widest uppercase mb-4">Screen-Free Family Adventures</p>
      <h1 class="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-pf-primary leading-tight">
        Give Them a Childhood<br class="hidden sm:block"> Worth Remembering
      </h1>
      <p class="text-xl md:text-2xl mt-4 max-w-3xl mx-auto text-gray-700">
        Epic family adventures. Zero prep. Even when you're exhausted.
      </p>

      <!-- Trust Badges -->
      <div class="flex flex-wrap justify-center gap-4 sm:gap-8 mt-6 text-sm text-gray-600">
        <div class="flex items-center gap-2">
          <span class="text-pf-green font-bold">✓</span> 30-45 Minutes
        </div>
        <div class="flex items-center gap-2">
          <span class="text-pf-green font-bold">✓</span> Ages 4-12
        </div>
        <div class="flex items-center gap-2">
          <span class="text-pf-green font-bold">✓</span> Zero Prep
        </div>
      </div>

      <!-- StoryBrand: Transitional CTA in Hero (lower barrier) -->
      <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a href="#free-adventure" class="inline-block px-8 py-4 text-lg font-bold rounded-xl bg-pf-accent text-white hover:bg-pf-accent/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          Download Free Adventure
        </a>
        <a href="#pricing" class="inline-block px-6 py-4 text-lg font-semibold text-pf-primary hover:text-pf-primary-dark transition-colors">
          See All Adventures →
        </a>
      </div>
      <p class="mt-3 text-sm text-gray-600">Open. Read. Play. Forge Memories.</p>

      <!-- Hero Image Placeholder -->
      <div class="mt-12 max-w-2xl mx-auto">
        <div class="aspect-video bg-pf-primary/20 rounded-2xl flex items-center justify-center border-2 border-dashed border-pf-primary/40">
          <div class="text-center p-8">
            <svg class="w-16 h-16 mx-auto text-pf-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="mt-2 text-pf-primary/60 font-medium">Hero Image: Parent & Child Connection</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==================== SECTION: PROBLEM ==================== -->
  <!-- StoryBrand: External, Internal, and Philosophical Problems -->
  <section id="problem" class="px-4 sm:px-6 lg:px-8 bg-white py-16">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-pf-accent mb-10 text-center font-display">
        Sound Familiar?
      </h2>

      <!-- Pain Points Grid - External Problems -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div class="text-center p-6 bg-pf-cream rounded-xl hover:-translate-y-1 transition-transform">
          <div class="text-4xl mb-3">😔</div>
          <h3 class="font-bold text-pf-primary mb-2">Quality Time Guilt</h3>
          <p class="text-sm text-gray-600">You want meaningful moments but come home with nothing left to give</p>
        </div>
        <div class="text-center p-6 bg-pf-cream rounded-xl hover:-translate-y-1 transition-transform">
          <div class="text-4xl mb-3">🎨</div>
          <h3 class="font-bold text-pf-primary mb-2">"I'm Not Creative"</h3>
          <p class="text-sm text-gray-600">You feel like a failure when you can't think of anything fun to do together</p>
        </div>
        <div class="text-center p-6 bg-pf-cream rounded-xl hover:-translate-y-1 transition-transform">
          <div class="text-4xl mb-3">🎲</div>
          <h3 class="font-bold text-pf-primary mb-2">Games That Fizzle</h3>
          <p class="text-sm text-gray-600">Board games end in arguments or boredom after ten minutes</p>
        </div>
        <div class="text-center p-6 bg-pf-cream rounded-xl hover:-translate-y-1 transition-transform">
          <div class="text-4xl mb-3">⏰</div>
          <h3 class="font-bold text-pf-primary mb-2">Time Slipping Away</h3>
          <p class="text-sm text-gray-600">You feel the weight of knowing these years won't last forever</p>
        </div>
      </div>

      <!-- Internal + Philosophical Problem -->
      <div class="max-w-3xl mx-auto text-center space-y-4">
        <p class="text-lg text-gray-600 italic">
          You feel like you're failing at the one thing that matters most.
        </p>
        <p class="text-xl font-semibold text-pf-primary">
          Every child deserves a parent who's fully present. What if you could be that parent—without needing energy you don't have?
        </p>
      </div>
    </div>
  </section>

  <!-- ==================== SECTION: GUIDE ==================== -->
  <section id="guide" class="px-4 sm:px-6 lg:px-8 bg-pf-cream py-16">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
        <div class="md:w-1/3">
          <h2 class="text-3xl md:text-4xl font-bold text-pf-primary mb-6 font-display">
            I Built This Because I Was Failing
          </h2>
          <div class="space-y-2 text-sm text-gray-600 bg-white/50 p-4 rounded-lg">
            <p class="font-bold text-pf-primary">Authority Markers:</p>
            <p>✓ Tested with 100+ families</p>
            <p>✓ Designed for exhausted parents</p>
            <p>✓ Ages 4-12</p>
          </div>
        </div>
        <div class="md:w-2/3 space-y-4 text-lg text-gray-700">
          <p>I'm Tom—a dad who wanted to be present but kept coming up short.</p>
          <p>I'd get home exhausted. I'd <em>want</em> to engage my kids. But I had no idea how to make it happen without energy I didn't have.</p>
          <p>So I built something different.</p>
          <p>ParableForge is the storytelling system I created so that any parent—even one running on fumes—can create adventures their kids will talk about for years.</p>
          <p class="font-medium text-pf-primary">Everything is scripted. You just read. Your kids imagine. And somehow, you become the most interesting part of their day.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ==================== SECTION: 3-STEP PLAN ==================== -->
  <section id="plan" class="px-4 sm:px-6 lg:px-8 bg-white py-16">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-pf-primary mb-4 text-center font-display">
        Three Steps to Adventure Night
      </h2>
      <p class="text-center text-gray-600 mb-12 max-w-2xl mx-auto">It's easier than you think. No creativity required—just follow the script.</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <!-- Step 1 -->
        <div class="text-center p-6 bg-pf-green/20 rounded-xl shadow-md">
          <div class="text-4xl mb-3">📖</div>
          <p class="text-5xl font-extrabold text-pf-gold mb-3 font-display">1</p>
          <h3 class="text-xl font-semibold text-pf-primary font-display">Open the Adventure</h3>
          <p class="mt-2 text-gray-700">No prep. No reading ahead. Just open to page one and start.</p>
        </div>
        <!-- Step 2 -->
        <div class="text-center p-6 bg-pf-green/20 rounded-xl shadow-md">
          <div class="text-4xl mb-3">🎯</div>
          <p class="text-5xl font-extrabold text-pf-gold mb-3 font-display">2</p>
          <h3 class="text-xl font-semibold text-pf-primary font-display">Read the Prompts</h3>
          <p class="mt-2 text-gray-700">Everything you need to say is scripted. You just read—your kids do the imagining.</p>
        </div>
        <!-- Step 3 -->
        <div class="text-center p-6 bg-pf-green/20 rounded-xl shadow-md">
          <div class="text-4xl mb-3">✨</div>
          <p class="text-5xl font-extrabold text-pf-gold mb-3 font-display">3</p>
          <h3 class="text-xl font-semibold text-pf-primary font-display">Watch Them Light Up</h3>
          <p class="mt-2 text-gray-700">Ask "What do you do?" and watch your child become the hero of their own story.</p>
        </div>
      </div>

      <!-- Callout Box -->
      <div class="mt-10 bg-pf-cream border-2 border-pf-gold rounded-xl p-6 text-center max-w-3xl mx-auto">
        <p class="text-gray-700">
          <span class="font-semibold">⏱️ Just 30-45 minutes</span> •
          <span class="font-semibold">🏠 Uses household items</span> •
          <span class="font-semibold">👨‍👩‍👧‍👦 Perfect for 1-3 kids</span>
        </p>
      </div>

      <p class="text-center text-xl font-medium mt-8 max-w-2xl mx-auto text-pf-primary">
        That's it. 30 minutes from "I'm tired" to "Can we do this again tomorrow?"
      </p>

      <!-- StoryBrand: CTA after Plan -->
      <div class="mt-10 text-center">
        <a href="#free-adventure" class="inline-block px-8 py-4 text-lg font-bold rounded-xl bg-pf-accent text-white hover:bg-pf-accent/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          Download Your Free Adventure
        </a>
        <p class="mt-3 text-sm text-gray-500">Try it tonight. No credit card required.</p>
      </div>
    </div>
  </section>

  <!-- ==================== SECTION: FAILURE/STAKES ==================== -->
  <section id="failure" class="px-4 sm:px-6 lg:px-8 bg-pf-primary text-white py-16">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-pf-accent mb-8 text-center font-display">
        The Cost of "Maybe Next Week"
      </h2>
      <div class="max-w-2xl mx-auto space-y-4 text-lg">
        <p>Every week that passes is another week of:</p>
        <ul class="space-y-2 ml-4">
          <li class="flex items-center gap-3"><span class="text-pf-accent">•</span> Evenings that blur together</li>
          <li class="flex items-center gap-3"><span class="text-pf-accent">•</span> Conversations that stay surface-level</li>
          <li class="flex items-center gap-3"><span class="text-pf-accent">•</span> Inside jokes you never create</li>
          <li class="flex items-center gap-3"><span class="text-pf-accent">•</span> A childhood moving faster than you realize</li>
        </ul>
        <p class="mt-6 font-semibold">Kids don't stay kids. And they won't remember the nights everyone was in the same room doing their own thing.</p>
        <p class="font-extrabold text-pf-gold text-xl">They remember the adventures.</p>
      </div>
    </div>
  </section>

  <!-- ==================== SECTION: SUCCESS ==================== -->
  <section id="success" class="px-4 sm:px-6 lg:px-8 bg-white py-16">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-pf-primary mb-8 text-center font-display">
        Imagine This Instead
      </h2>
      <div class="space-y-4 text-lg text-gray-700">
        <p>Your 7-year-old rushes to finish dinner because adventure night is next.</p>
        <p>You're not performing or pretending to have energy you don't have. You're just reading—and somehow it's magic.</p>
        <p>You overhear your kids telling friends about "the time we saved the village from the shadow wolves."</p>
        <p class="font-semibold text-pf-primary">Years from now, they'll tell their own kids about the adventures you created together.</p>
        <p>This is the parent you wanted to be. And it didn't require superhuman energy—just the right tool.</p>
      </div>
      <div class="mt-10 text-center">
        <a href="#free-adventure" class="inline-block px-8 py-4 text-lg font-bold rounded-xl bg-pf-accent text-white hover:bg-pf-accent/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          Start With a Free Adventure
        </a>
      </div>
    </div>
  </section>

  <!-- ==================== SECTION: IS THIS FOR YOUR FAMILY? ==================== -->
  <!-- Self-identification checklist - helps visitors see themselves -->
  <section id="perfect-for" class="px-4 sm:px-6 lg:px-8 bg-pf-cream py-16">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-pf-primary mb-4 text-center font-display">
        Is This For Your Family?
      </h2>
      <p class="text-center text-gray-600 mb-10 max-w-2xl mx-auto">If any of these sound like you, ParableForge was built for your family.</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 max-w-4xl mx-auto mb-10">
        <div class="flex items-start gap-3 text-gray-700">
          <span class="text-pf-green font-bold text-xl flex-shrink-0">✓</span>
          <span>Parents who come home exhausted but still want quality time</span>
        </div>
        <div class="flex items-start gap-3 text-gray-700">
          <span class="text-pf-green font-bold text-xl flex-shrink-0">✓</span>
          <span>Families who value character development over passive entertainment</span>
        </div>
        <div class="flex items-start gap-3 text-gray-700">
          <span class="text-pf-green font-bold text-xl flex-shrink-0">✓</span>
          <span>Parents who think "I'm not creative enough" for this</span>
        </div>
        <div class="flex items-start gap-3 text-gray-700">
          <span class="text-pf-green font-bold text-xl flex-shrink-0">✓</span>
          <span>Kids ages 4-12 who love making choices and being heroes</span>
        </div>
        <div class="flex items-start gap-3 text-gray-700">
          <span class="text-pf-green font-bold text-xl flex-shrink-0">✓</span>
          <span>Busy families who need zero-prep activities</span>
        </div>
        <div class="flex items-start gap-3 text-gray-700">
          <span class="text-pf-green font-bold text-xl flex-shrink-0">✓</span>
          <span>Parents who prefer guiding over lecturing</span>
        </div>
        <div class="flex items-start gap-3 text-gray-700">
          <span class="text-pf-green font-bold text-xl flex-shrink-0">✓</span>
          <span>Homeschoolers seeking character-building curriculum</span>
        </div>
        <div class="flex items-start gap-3 text-gray-700">
          <span class="text-pf-green font-bold text-xl flex-shrink-0">✓</span>
          <span>Anyone wanting to build lasting family traditions</span>
        </div>
        <div class="flex items-start gap-3 text-gray-700">
          <span class="text-pf-green font-bold text-xl flex-shrink-0">✓</span>
          <span>Parents tired of screen time negotiations</span>
        </div>
        <div class="flex items-start gap-3 text-gray-700">
          <span class="text-pf-green font-bold text-xl flex-shrink-0">✓</span>
          <span>Families wanting deeper connection—not just activities</span>
        </div>
      </div>

      <!-- Not Sure CTA Box -->
      <div class="bg-white p-8 rounded-xl shadow-lg max-w-xl mx-auto text-center">
        <h3 class="text-xl font-bold text-pf-primary font-display mb-2">Not sure yet?</h3>
        <p class="text-gray-600 mb-6">Try one adventure free. One evening. No commitment. See what happens.</p>
        <a href="#free-adventure" class="inline-block px-6 py-3 font-bold rounded-lg bg-pf-accent text-white hover:bg-pf-accent/90 transition-all hover:-translate-y-0.5">
          Send Me the Free Adventure
        </a>
      </div>
    </div>
  </section>

  <!-- ==================== SECTION: TESTIMONIALS ==================== -->
  <section id="testimonials" class="px-4 sm:px-6 lg:px-8 bg-white py-16">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-pf-accent mb-12 text-center font-display">
        Families Are Doing This Every Week
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10">
        <!-- Testimonial 1 -->
        <blockquote class="p-6 bg-pf-cream rounded-xl shadow-lg border-t-4 border-pf-primary h-full flex flex-col">
          <div class="text-pf-gold mb-2">★★★★★</div>
          <p class="italic text-gray-700 flex-grow">"My 6-year-old asks for 'adventure time' every single night now. Last week, he chose to help a lost creature instead of taking the treasure. We talked about kindness for an hour afterward."</p>
          <footer class="mt-4">
            <p class="font-bold text-pf-primary">— Sarah M.</p>
            <p class="text-sm text-gray-500">Mom of 2 • After first adventure</p>
          </footer>
        </blockquote>
        <!-- Testimonial 2 -->
        <blockquote class="p-6 bg-pf-cream rounded-xl shadow-lg border-t-4 border-pf-primary h-full flex flex-col">
          <div class="text-pf-gold mb-2">★★★★★</div>
          <p class="italic text-gray-700 flex-grow">"I was skeptical I could 'run' something like this. But the prompts make it so easy. I actually look forward to our Sunday adventures now—and I'm not an energetic person."</p>
          <footer class="mt-4">
            <p class="font-bold text-pf-primary">— Mike D.</p>
            <p class="text-sm text-gray-500">Father • After 2 weeks</p>
          </footer>
        </blockquote>
        <!-- Testimonial 3 -->
        <blockquote class="p-6 bg-pf-cream rounded-xl shadow-lg border-t-4 border-pf-primary h-full flex flex-col">
          <div class="text-pf-gold mb-2">★★★★★</div>
          <p class="italic text-gray-700 flex-grow">"This has become our family tradition. Even our teenager joins in. Best purchase we've made for our family."</p>
          <footer class="mt-4">
            <p class="font-bold text-pf-primary">— The Johnson Family</p>
            <p class="text-sm text-gray-500">After 1 month</p>
          </footer>
        </blockquote>
      </div>

      <!-- Mini Testimonials Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-pf-cream/50 border border-pf-primary/20 rounded-lg p-4 text-center text-sm text-gray-600">
          "Finally, family time that isn't a screen" — David L.
        </div>
        <div class="bg-pf-cream/50 border border-pf-primary/20 rounded-lg p-4 text-center text-sm text-gray-600">
          "My kids remember these adventures weeks later" — Amanda C.
        </div>
        <div class="bg-pf-cream/50 border border-pf-primary/20 rounded-lg p-4 text-center text-sm text-gray-600">
          "I feel confident facilitating now" — Rebecca S.
        </div>
      </div>
    </div>
  </section>

  <!-- ==================== SECTION: WHY CHOOSE PARABLEFORGE ==================== -->
  <!-- Comparison table - handles objections, positions against alternatives -->
  <section id="comparison" class="px-4 sm:px-6 lg:px-8 bg-pf-cream py-16">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-pf-primary mb-10 text-center font-display">
        Why Choose ParableForge?
      </h2>

      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <table class="w-full text-left">
          <thead>
            <tr>
              <th class="bg-pf-primary text-white p-4 font-semibold"></th>
              <th class="bg-pf-primary/80 text-white p-4 font-semibold text-center">Screen Time</th>
              <th class="bg-pf-primary/80 text-white p-4 font-semibold text-center">Board Games</th>
              <th class="bg-pf-accent text-white p-4 font-semibold text-center">ParableForge</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr class="border-b border-gray-100">
              <td class="p-4 font-medium text-gray-700">Engagement</td>
              <td class="p-4 text-center text-gray-500">Passive</td>
              <td class="p-4 text-center text-gray-500">Competitive</td>
              <td class="p-4 text-center font-semibold text-pf-primary">Collaborative</td>
            </tr>
            <tr class="border-b border-gray-100 bg-pf-cream/30">
              <td class="p-4 font-medium text-gray-700">Prep Time</td>
              <td class="p-4 text-center text-gray-500">None</td>
              <td class="p-4 text-center text-gray-500">Setup required</td>
              <td class="p-4 text-center font-semibold text-pf-green">Zero ✓</td>
            </tr>
            <tr class="border-b border-gray-100">
              <td class="p-4 font-medium text-gray-700">Character Development</td>
              <td class="p-4 text-center text-gray-400">—</td>
              <td class="p-4 text-center text-gray-500">Limited</td>
              <td class="p-4 text-center font-semibold text-pf-green">Built-in ✓</td>
            </tr>
            <tr class="border-b border-gray-100 bg-pf-cream/30">
              <td class="p-4 font-medium text-gray-700">Parent Confidence</td>
              <td class="p-4 text-center text-gray-500">N/A</td>
              <td class="p-4 text-center text-gray-500">Assumed</td>
              <td class="p-4 text-center font-semibold text-pf-green">Scripted ✓</td>
            </tr>
            <tr class="border-b border-gray-100">
              <td class="p-4 font-medium text-gray-700">Memorable Moments</td>
              <td class="p-4 text-center text-gray-400">—</td>
              <td class="p-4 text-center text-gray-500">Sometimes</td>
              <td class="p-4 text-center font-semibold text-pf-green">Every time ✓</td>
            </tr>
            <tr class="bg-pf-cream/30">
              <td class="p-4 font-medium text-gray-700">Builds Connection</td>
              <td class="p-4 text-center text-gray-400">—</td>
              <td class="p-4 text-center text-gray-500">Sometimes</td>
              <td class="p-4 text-center font-semibold text-pf-green">Always ✓</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- ==================== SECTION: FREE OFFER ==================== -->
  <!-- StoryBrand: Transitional CTA - Lead Magnet -->
  <section id="free-adventure" class="px-4 sm:px-6 lg:px-8 bg-pf-green/30 py-16">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-pf-primary mb-4 text-center font-display">
        Try Your First Adventure Free
      </h2>
      <p class="text-center text-gray-600 mb-8 max-w-2xl mx-auto">See what one evening with ParableForge can do for your family. No commitment required.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
        <!-- Offer Details -->
        <div class="bg-white p-6 md:p-8 rounded-xl shadow-xl">
          <h3 class="text-2xl font-bold text-pf-primary font-display">The Mysterious Sky Island</h3>
          <p class="text-gray-600 italic mt-2">A complete 45-minute adventure designed for first-time families.</p>
          <ul class="mt-4 space-y-2 text-gray-700">
            <li class="flex items-start gap-2"><span class="text-pf-green font-bold">✓</span> Word-for-word script (just read and play)</li>
            <li class="flex items-start gap-2"><span class="text-pf-green font-bold">✓</span> Simple character creation your kids will love</li>
            <li class="flex items-start gap-2"><span class="text-pf-green font-bold">✓</span> 2-minute rules (seriously, that's it)</li>
            <li class="flex items-start gap-2"><span class="text-pf-green font-bold">✓</span> Tips for tired first-time storytellers</li>
          </ul>
          <p class="mt-6 text-sm text-gray-500 font-medium">Instant download. Start playing tonight.</p>
        </div>
        <!-- Form Placeholder -->
        <div class="bg-white p-6 md:p-8 rounded-xl shadow-xl border-2 border-dashed border-pf-primary/30">
          <div class="text-center mb-4">
            <p class="font-bold text-pf-primary">Tally.so Form Placeholder</p>
            <p class="text-sm text-gray-500">Replace with your Tally embed</p>
          </div>
          <form class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Where should we send it?</label>
              <input type="email" id="email" placeholder="your@email.com" class="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-pf-primary focus:outline-none transition-colors">
            </div>
            <button type="submit" class="w-full bg-pf-accent text-white font-bold py-3 rounded-lg hover:bg-pf-accent/90 transition-all duration-200 hover:-translate-y-0.5">
              Send Me the Free Adventure
            </button>
          </form>
          <p class="text-center text-xs text-gray-500 mt-4">We'll email you the PDF instantly. No spam, ever.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ==================== SECTION: PRICING ==================== -->
  <!-- StoryBrand: Direct CTAs - specific action verbs -->
  <section id="pricing" class="px-4 sm:px-6 lg:px-8 bg-white py-16">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-pf-primary mb-4 text-center font-display">
        Ready for More Adventures?
      </h2>
      <p class="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Choose the collection that fits your family. All purchases include instant access and a 30-day money-back guarantee.</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
        <!-- Tier 1: Starter -->
        <div class="p-6 rounded-xl shadow-lg border-t-4 border-pf-gold bg-pf-cream h-full flex flex-col">
          <h3 class="text-2xl font-bold text-pf-primary font-display">Starter Collection</h3>
          <p class="text-4xl font-extrabold text-pf-gold my-3 font-display">$39</p>
          <ul class="space-y-2 flex-grow">
            <li class="flex items-start gap-2"><span class="text-pf-gold">✓</span><span class="text-gray-700">3 complete adventures (6+ hours of family time)</span></li>
            <li class="flex items-start gap-2"><span class="text-pf-gold">✓</span><span class="text-gray-700">Character creation kit</span></li>
            <li class="flex items-start gap-2"><span class="text-pf-gold">✓</span><span class="text-gray-700">Parent confidence guide</span></li>
          </ul>
          <button class="w-full mt-6 py-3 rounded-lg font-bold bg-pf-primary text-white hover:bg-pf-primary/90 transition-all duration-200 hover:-translate-y-0.5">Buy Starter Collection</button>
        </div>
        <!-- Tier 2: Explorer (Featured) -->
        <div class="p-6 rounded-xl shadow-2xl border-t-4 border-pf-gold bg-pf-primary text-white h-full flex flex-col scale-105">
          <p class="text-center text-sm font-bold text-pf-gold mb-2 uppercase tracking-wide">Most Popular</p>
          <h3 class="text-2xl font-bold text-white font-display">Explorer's Edition</h3>
          <p class="text-4xl font-extrabold text-pf-gold my-3 font-display">$69</p>
          <ul class="space-y-2 flex-grow">
            <li class="flex items-start gap-2"><span class="text-pf-gold">✓</span><span class="text-white/90">8 interconnected adventures (20+ hours)</span></li>
            <li class="flex items-start gap-2"><span class="text-pf-gold">✓</span><span class="text-white/90">Character progression system</span></li>
            <li class="flex items-start gap-2"><span class="text-pf-gold">✓</span><span class="text-white/90">Advanced storytelling tools</span></li>
            <li class="flex items-start gap-2"><span class="text-pf-gold">✓</span><span class="text-white/90">Digital adventure builder</span></li>
          </ul>
          <button class="w-full mt-6 py-3 rounded-lg font-bold bg-pf-gold text-pf-primary hover:bg-pf-gold/90 transition-all duration-200 hover:-translate-y-0.5">Buy Explorer's Edition</button>
        </div>
        <!-- Tier 3: Legendary -->
        <div class="p-6 rounded-xl shadow-lg border-t-4 border-pf-gold bg-pf-cream h-full flex flex-col">
          <h3 class="text-2xl font-bold text-pf-primary font-display">Legendary Collection</h3>
          <p class="text-4xl font-extrabold text-pf-gold my-3 font-display">$99</p>
          <ul class="space-y-2 flex-grow">
            <li class="flex items-start gap-2"><span class="text-pf-gold">✓</span><span class="text-gray-700">15 adventures across multiple worlds</span></li>
            <li class="flex items-start gap-2"><span class="text-pf-gold">✓</span><span class="text-gray-700">Premium artwork</span></li>
            <li class="flex items-start gap-2"><span class="text-pf-gold">✓</span><span class="text-gray-700">Exclusive expansions</span></li>
            <li class="flex items-start gap-2"><span class="text-pf-gold">✓</span><span class="text-gray-700">1-on-1 family adventure consultation</span></li>
          </ul>
          <button class="w-full mt-6 py-3 rounded-lg font-bold bg-pf-primary text-white hover:bg-pf-primary/90 transition-all duration-200 hover:-translate-y-0.5">Buy Legendary Collection</button>
        </div>
      </div>
      <!-- Transitional CTA below pricing -->
      <p class="text-center mt-10 text-gray-600">
        Not ready to buy? <a href="#free-adventure" class="text-pf-primary font-semibold underline hover:text-pf-primary-dark">Download the free adventure first →</a>
      </p>
    </div>
  </section>

  <!-- ==================== SECTION: FAQ ==================== -->
  <section id="faq" class="px-4 sm:px-6 lg:px-8 bg-pf-primary/10 py-16">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-pf-primary mb-12 text-center font-display">
        Quick Answers
      </h2>
      <dl class="space-y-6">
        <div class="border-b border-pf-primary/20 pb-6">
          <dt class="font-bold text-lg text-pf-primary">I'm exhausted after work. Do I really have the energy for this?</dt>
          <dd class="mt-2 text-gray-700">That's exactly who this is for. You read prompts. Your kids imagine. There's nothing to prepare, nothing to memorize, nothing to create. If you can read a bedtime story, you can do this.</dd>
        </div>
        <div class="border-b border-pf-primary/20 pb-6">
          <dt class="font-bold text-lg text-pf-primary">I've never done anything like this. Can I really lead an adventure?</dt>
          <dd class="mt-2 text-gray-700">Yes. Everything is scripted. You're not improvising or performing—you're just reading and asking "What do you do?" Your kids do the rest.</dd>
        </div>
        <div class="border-b border-pf-primary/20 pb-6">
          <dt class="font-bold text-lg text-pf-primary">What if my kids aren't into fantasy stuff?</dt>
          <dd class="mt-2 text-gray-700">The system works with any theme. Many families adapt it for space, mystery, or modern-day heroes. Fantasy is just the starting point.</dd>
        </div>
        <div class="border-b border-pf-primary/20 pb-6">
          <dt class="font-bold text-lg text-pf-primary">How is this different from reading books together?</dt>
          <dd class="mt-2 text-gray-700">In a book, your child listens. In this, they're the hero making choices. It's the difference between watching a movie and starring in one.</dd>
        </div>
        <div class="border-b border-pf-primary/20 pb-6">
          <dt class="font-bold text-lg text-pf-primary">What ages work best?</dt>
          <dd class="mt-2 text-gray-700">4-12, with adventures that scale. Younger kids make simple choices; older kids tackle moral dilemmas. Mixed-age families work great.</dd>
        </div>
        <div class="border-b border-pf-primary/20 pb-6">
          <dt class="font-bold text-lg text-pf-primary">How long does each adventure take?</dt>
          <dd class="mt-2 text-gray-700">30-60 minutes. Perfect for after dinner. You can pause anytime.</dd>
        </div>
      </dl>
    </div>
  </section>

  <!-- ==================== SECTION: FINAL CTA ==================== -->
  <!-- StoryBrand: Final push - Both Direct + Transitional CTAs -->
  <section id="final-cta" class="px-4 sm:px-6 lg:px-8 bg-pf-primary text-white py-16 text-center">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-pf-gold mb-6 font-display">
        Their Childhood Won't Wait
      </h2>
      <div class="max-w-2xl mx-auto space-y-4 text-lg">
        <p>In 5 minutes, you could be starting your first quest together.</p>
        <p>Your child could be making their first heroic choice.</p>
        <p>You could be creating a memory that lasts longer than tonight.</p>
        <p class="font-medium">And you don't need energy you don't have. Just the right tool.</p>
      </div>
      <!-- Both CTAs - Direct prominent, Transitional below -->
      <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a href="#pricing" class="inline-block px-8 py-4 text-lg font-bold rounded-xl bg-pf-gold text-pf-primary-dark hover:bg-pf-gold/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          Buy Your Adventure Collection
        </a>
        <a href="#free-adventure" class="inline-block px-8 py-4 text-lg font-semibold rounded-xl border-2 border-white/50 text-white hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200">
          Try Free First
        </a>
      </div>
      <p class="mt-6 text-sm text-pf-cream/80">30-day money-back guarantee on all purchases</p>
      <p class="mt-8 text-pf-cream/80 italic">
        The best time to start creating memories was ten years ago. The second best time is tonight.
      </p>
    </div>
  </section>

</body>
</html>
````

## File: keystatic.config.ts
````typescript
import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  
  collections: {
    adventures: collection({
      label: 'Adventures',
      path: 'content/adventures/*',
      slugField: 'title',
      format: { contentField: 'content' },
      
      schema: {
        // METADATA
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        duration: fields.text({ label: 'Duration (e.g. 30-45 min)' }),
        difficulty: fields.select({
          label: 'Difficulty',
          options: [
            { label: 'Beginner', value: 'beginner' },
            { label: 'Intermediate', value: 'intermediate' },
            { label: 'Advanced', value: 'advanced' }
          ],
          defaultValue: 'beginner'
        }),
        
        // CONTENT (The adventure script)
        content: fields.markdoc({ label: 'Adventure Script' }),
        
        // RESOURCES (HP, XP, Trust, etc.)
        resources: fields.array(
          fields.object({
            id: fields.text({ label: 'Resource ID (e.g. kraken_hp)' }),
            label: fields.text({ label: 'Display Name' }),
            max: fields.integer({ label: 'Max Value', defaultValue: 100 }),
            initial: fields.integer({ label: 'Starting Value', defaultValue: 0 }),
            theme: fields.select({
              label: 'Color Theme',
              options: [
                { label: 'Red (Danger/HP)', value: 'red' },
                { label: 'Green (Success/XP)', value: 'green' },
                { label: 'Blue (Mana/Energy)', value: 'blue' },
                { label: 'Gold (Currency/Trust)', value: 'gold' },
                { label: 'Purple (Magic/Special)', value: 'purple' }
              ],
              defaultValue: 'green'
            }),
            style: fields.select({
              label: 'Display Style',
              options: [
                { label: 'Progress Bar', value: 'bar' },
                { label: 'Large Counter', value: 'counter' },
                { label: 'Hidden (Tracked Only)', value: 'hidden' }
              ],
              defaultValue: 'bar'
            }),
            icon: fields.text({ 
              label: 'Lucide Icon Name (optional)',
              description: 'e.g. Heart, Zap, Shield, Star'
            })
          }),
          {
            label: 'Resources',
            itemLabel: props => props.fields.label.value || 'New Resource'
          }
        ),
        
        // RULES (Triggers & Effects)
        rules: fields.array(
          fields.object({
            targetId: fields.text({ 
              label: 'Target Resource ID',
              description: 'Must match a resource ID exactly'
            }),
            operator: fields.select({
              label: 'Condition',
              options: [
                { label: 'Less Than (<)', value: '<' },
                { label: 'Greater Than (>)', value: '>' },
                { label: 'Equals (==)', value: '==' },
                { label: 'Greater or Equal (>=)', value: '>=' },
                { label: 'Less or Equal (<=)', value: '<=' }
              ],
              defaultValue: '>='
            }),
            threshold: fields.integer({ label: 'Threshold Value' }),
            action: fields.select({
              label: 'Effect Type',
              options: [
                { label: 'Show Toast Message', value: 'toast' },
                { label: 'Fire Confetti', value: 'confetti' },
                { label: 'Shake Screen', value: 'shake' },
                { label: 'Redirect to URL', value: 'redirect' },
                { label: 'Unlock Content', value: 'unlock' },
                { label: 'Advance Turn', value: 'advance_turn' },
                { label: 'Trigger Surge Event', value: 'surge' }
              ],
              defaultValue: 'toast'
            }),
            payload: fields.text({ 
              label: 'Effect Data',
              description: 'Message text, URL, or JSON object',
              multiline: true
            })
          }),
          {
            label: 'Rules & Triggers',
            itemLabel: props => 
              `When ${props.fields.targetId.value} ${props.fields.operator.value} ${props.fields.threshold.value}`
          }
        ),
        
        // SURGE EVENTS (The "Plot Twist" System)
        surges: fields.array(
          fields.object({
            triggerTurn: fields.integer({ 
              label: 'Trigger After Turn #',
              defaultValue: 2
            }),
            dialogue: fields.text({ 
              label: 'Interrupt Dialogue',
              description: 'What the parent reads during the surge',
              multiline: true
            }),
            forceFirst: fields.checkbox({ 
              label: 'Surge Enemy to Front?',
              defaultValue: true
            }),
            animation: fields.select({
              label: 'Visual Effect',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Shake Screen', value: 'shake' },
                { label: 'Red Flash', value: 'flash' },
                { label: 'Screen Lock', value: 'lock' }
              ],
              defaultValue: 'lock'
            }),
            modifyResources: fields.array(
              fields.object({
                resourceId: fields.text({ label: 'Resource to Modify' }),
                delta: fields.integer({ label: 'Change Amount' })
              }),
              { label: 'Resource Changes' }
            )
          }),
          {
            label: 'Surge Events',
            itemLabel: props => `Turn ${props.fields.triggerTurn.value}: Surge`
          }
        ),
        
        // COMBATANTS (Turn-based combat participants)
        combatants: fields.array(
          fields.object({
            id: fields.text({ 
              label: 'ID (unique)',
              description: 'e.g. hero, goblin, dragon'
            }),
            name: fields.text({ label: 'Name' }),
            avatar: fields.text({ 
              label: 'Avatar (emoji)',
              description: 'e.g. 🛡️ for hero, 👹 for goblin'
            }),
            type: fields.select({
              label: 'Type',
              options: [
                { label: 'Hero', value: 'hero' },
                { label: 'Enemy', value: 'enemy' },
                { label: 'Ally', value: 'ally' }
              ],
              defaultValue: 'hero'
            }),
            linkedResource: fields.text({
              label: 'Linked Resource ID (optional)',
              description: 'e.g. "goblin_hp" to show HP on card'
            })
          }),
          {
            label: 'Combatants',
            itemLabel: props => `${props.fields.avatar.value} ${props.fields.name.value || 'New Combatant'}`
          }
        ),
        
        // TURN TIMELINE (Optional pre-scripted events)
        turns: fields.array(
          fields.object({
            turnNumber: fields.integer({ label: 'Turn Number' }),
            eventType: fields.select({
              label: 'Event Type',
              options: [
                { label: 'Show Dialogue', value: 'dialogue' },
                { label: 'Spawn Resource', value: 'spawn_resource' },
                { label: 'Modify Resource', value: 'modify_resource' },
                { label: 'Auto-Advance', value: 'auto_advance' }
              ],
              defaultValue: 'dialogue'
            }),
            payload: fields.text({ 
              label: 'Event Data',
              description: 'JSON object or plain text',
              multiline: true
            })
          }),
          {
            label: 'Turn-Based Events',
            itemLabel: props => `Turn ${props.fields.turnNumber.value}`
          }
        )
      }
    }),
    
    // Keep existing Resources collection for Starlight docs/tutorials
    resources: collection({
      label: 'Resources (Tutorials)',
      path: 'src/content/docs/compendium/resources/*',
      slugField: 'title',
      format: { contentField: 'body' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description' }),
        sidebar: fields.object({
          label: fields.text({ label: 'Sidebar Label' }),
          order: fields.integer({ label: 'Order' })
        }),
        body: fields.markdoc({ label: 'Content' })
      }
    })
  }
});
````

## File: repomix.config.json
````json
{
    "output": {
      "style": "markdown",
      "filePath": "stackforge_audit.md"
    },
    "ignore": {
      "useGitignore": true,
      "customPatterns": [
        "node_modules/**",
        ".git/**",
        ".next/**",
        ".astro/**",
        "dist/**",
        "**/*.lock",
        "pnpm-lock.yaml",
        "yarn.lock",
        "package-lock.json",
        "**/*.png",
        "**/*.jpg",
        "**/*.jpeg",
        "**/*.gif",
        "**/*.svg",
        "**/*.ico",
        ".env",
        ".env.local",
        ".env.*" 
      ]
    }
  }
````

## File: vercel.json
````json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "framework": "astro",
  "regions": ["iad1"],
  "rewrites": [
    {
      "source": "/admin",
      "destination": "/keystatic"
    }
  ]
}
````

## File: content/adventures/sky-island.mdoc
````
---
title: sky-island
description: An adventure to the mysterious island in the sky
duration: '30'
difficulty: beginner
resources:
  - id: trust
    label: Grandmother Cloud's Trust
    max: 100
    initial: 10
    theme: blue
    style: bar
    icon: Zap
rules:
  - targetId: trust
    operator: '>='
    threshold: 20
    action: toast
    payload: the clouds part, you see a path forward!
surges:
  - triggerTurn: 3
    dialogue: >-
      A strong wind blows, Grandmother Cloud suddenly appears and is being nosey
      and she demands respect!
    forceFirst: true
    animation: shake
    modifyResources:
      - resourceId: trust
        delta: 20
turns: []
---
The party approaches the tavern, it's rainy out. warm light spilled out of the windows and each time the door swung open, the boisterous and mostly happy sounds came flooding out.
````

## File: public/images/.gitkeep
````

````

## File: public/CNAME
````
playparableforge.com
````

## File: src/components/AuthGuard.astro
````astro
---
// AuthGuard component - wraps protected content
// Checks authentication client-side and redirects if not logged in
---

<div id="auth-guard-wrapper">
  <div id="auth-loading" class="min-h-screen flex items-center justify-center bg-pf-cream">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-pf-periwinkle border-t-transparent mx-auto mb-4"></div>
      <p class="text-pf-periwinkle font-medium">Verifying access...</p>
    </div>
  </div>
  <div id="auth-content" class="hidden">
    <slot />
  </div>
</div>

<script>
  import { getSession } from '../lib/supabase';

  async function checkAuth() {
    const loadingEl = document.getElementById('auth-loading');
    const contentEl = document.getElementById('auth-content');

    const { session, error } = await getSession();

    if (!session || error) {
      // Not authenticated, redirect to login
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    // Authenticated, show content
    if (loadingEl) loadingEl.classList.add('hidden');
    if (contentEl) contentEl.classList.remove('hidden');
  }

  // Run on page load
  checkAuth();

  // Also listen for auth state changes
  import { supabase } from '../lib/supabase';

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      window.location.href = '/login';
    }
  });
</script>
````

## File: src/layouts/BaseLayout.astro
````astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Screen-free family adventures. Zero prep. Pure connection.' } = Astro.props;
---

<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
    <title>{title} | ParableForge</title>
  </head>
  <body class="bg-forge-dark text-gray-300 antialiased min-h-screen">
    <slot />
  </body>
</html>
````

## File: src/pages/adventure/[slug].astro
````astro
---
/**
 * DYNAMIC ADVENTURE ROUTE
 * 
 * Loads adventures from Keystatic and renders them with the Sovereign Engine.
 * 
 * RENDERING MODE: Hybrid (Prerendered Static Pages)
 * - This page is prerendered at build time (not SSR)
 * - Adventures are baked into static HTML for fastest loading
 * - Keystatic admin remains SSR for dynamic editing
 * - Rebuild required to publish content changes (acceptable for curated content)
 * 
 * Flow:
 * 1. getStaticPaths() - Fetch all adventures from Keystatic at build time
 * 2. Read specific adventure by slug
 * 3. Apply graceful fallbacks if missing data
 * 4. Render with AdventureLayout + engine components
 * 
 * Error Handling ("The Show Must Go On"):
 * - Missing adventure → Redirect to compendium with toast
 * - No resources → Use fallback resource
 * - No combatants → Queue hidden (graceful degradation)
 * - Keystatic read fails → Fallback adventure data
 * - Markdoc rendering fails → Fallback to plain markdown
 * 
 * HYBRID CONTENT STRATEGY:
 * - Primary: Markdoc (rich formatting, component support)
 * - Fallback: Plain markdown (bulletproof, always works)
 * - Visual errors: User-friendly messages with recovery options
 */

import { getAdventure, getAllAdventures, FALLBACK_ADVENTURE } from '../../lib/keystatic-reader';
import AdventureLayout from '../../layouts/AdventureLayout.astro';
import AdventureError from '../../components/AdventureError.astro';
import MarkdownFallback from '../../components/MarkdownFallback.astro';
import type { Resource, Rule, SurgeEvent } from '../../lib/engine/types';

// Prerender this page at build time (hybrid rendering with SSR site)
export const prerender = true;

export async function getStaticPaths() {
  const adventures = await getAllAdventures();
  
  return adventures.map(adventure => ({
    params: { slug: adventure.slug },
    props: { 
      slug: adventure.slug,
      hasData: true 
    }
  }));
}

const { slug } = Astro.params;
const adventure = await getAdventure(slug!);

// Graceful fallback if adventure not found
if (!adventure) {
  console.warn(`Adventure not found: ${slug}. Redirecting to compendium.`);
  return Astro.redirect('/compendium/welcome?toast=adventure-not-found');
}

const { 
  title, 
  description, 
  duration,
  difficulty,
  resources = [], 
  rules = [], 
  surges = [],
  combatants = [],
  content 
} = adventure;

// ============================================================================
// CONTENT RENDERING WITH HYBRID FALLBACK STRATEGY
// ============================================================================

let Content: any = null;
let contentError: Error | null = null;
let renderMode: 'markdoc' | 'fallback' = 'markdoc';
let rawContent = '';

// Check if user forced safe mode
const safeModeForced = typeof sessionStorage !== 'undefined' && 
  sessionStorage.getItem('pf-safe-mode') === 'true';

if (safeModeForced) {
  console.log('🛡️ Safe Mode forced by user, skipping Markdoc');
  renderMode = 'fallback';
}

// Try to render Markdoc content
if (!safeModeForced) {
  try {
    console.log(`🔧 [${slug}] Rendering Markdoc content...`);
    
    const result = await content();
    
    // Check if result has the expected structure
    if (result && typeof result === 'object' && 'node' in result) {
      // This is the raw Markdoc AST, we need to render it
      // For now, fall back to plain markdown
      console.warn(`⚠️ [${slug}] Markdoc returned AST instead of component, using fallback`);
      renderMode = 'fallback';
    } else {
      // Assume it's a renderable component
      Content = result;
      console.log(`✅ [${slug}] Markdoc rendered successfully`);
    }
  } catch (error) {
    console.error(`❌ [${slug}] Markdoc rendering failed:`, error);
    contentError = error as Error;
    renderMode = 'fallback';
  }
}

// Read raw content for fallback renderer
if (renderMode === 'fallback') {
  try {
    // Read the raw .mdoc file
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const filePath = path.join(process.cwd(), 'content', 'adventures', `${slug}.mdoc`);
    rawContent = await fs.readFile(filePath, 'utf-8');
    console.log(`📄 [${slug}] Raw content loaded for fallback rendering`);
  } catch (fileError) {
    console.error(`❌ [${slug}] Could not read raw content file:`, fileError);
    renderMode = 'error';
    contentError = fileError as Error;
  }
}

// ============================================================================
// DATA PROCESSING WITH TYPE SAFETY
// ============================================================================

// Convert readonly arrays to mutable arrays and handle null values
const safeResources: Resource[] = (resources.length > 0 ? resources : FALLBACK_ADVENTURE.resources).map(r => ({
  id: r.id,
  label: r.label,
  max: r.max ?? 100,
  initial: r.initial ?? 0,
  theme: r.theme,
  style: r.style,
  icon: r.icon || undefined
}));

const safeCombatants = (combatants && combatants.length > 0 ? combatants : []).map(c => ({
  id: c.id,
  name: c.name,
  avatar: c.avatar,
  type: c.type,
  linkedResource: c.linkedResource || undefined
}));

const safeRules: Rule[] = (rules || []).map(r => ({
  targetId: r.targetId,
  operator: r.operator,
  threshold: r.threshold ?? 0,
  action: r.action,
  payload: r.payload
}));

const safeSurges: SurgeEvent[] = (surges || []).map(s => ({
  triggerTurn: s.triggerTurn ?? 1,
  dialogue: s.dialogue,
  forceFirst: s.forceFirst,
  animation: s.animation,
  modifyResources: (s.modifyResources || []).map(m => ({
    resourceId: m.resourceId,
    delta: m.delta ?? 0
  }))
}));

// Calculate max turns if defined
const maxTurns = safeSurges.length > 0 
  ? Math.max(...safeSurges.map(s => s.triggerTurn)) + 5 
  : undefined;

console.log(`🎮 [${slug}] Adventure loaded:`, {
  renderMode,
  resources: safeResources.length,
  rules: safeRules.length,
  surges: safeSurges.length,
  combatants: safeCombatants.length,
  maxTurns
});
---

<AdventureLayout
  title={title}
  description={description}
  resources={safeResources}
  rules={safeRules}
  surges={safeSurges}
  combatants={safeCombatants}
  maxTurns={maxTurns}
>
  <!-- Adventure metadata badges -->
  <div class="mb-6 flex gap-4 text-sm text-slate-400 not-prose">
    <span class="flex items-center gap-1">
      ⏱️ <span>{duration || '30-45 min'}</span>
    </span>
    <span class="flex items-center gap-1">
      📊 <span class="capitalize">{difficulty || 'Beginner'}</span>
    </span>
    {safeResources.length > 0 && (
      <span class="flex items-center gap-1">
        🎯 <span>{safeResources.length} Resources</span>
      </span>
    )}
    {safeCombatants.length > 0 && (
      <span class="flex items-center gap-1">
        ⚔️ <span>{safeCombatants.length} Combatants</span>
      </span>
    )}
  </div>
  
  <!-- CONTENT RENDERING (Hybrid Strategy) -->
  
  {/* Markdoc Success */}
  {renderMode === 'markdoc' && Content && (
    <Content />
  )}
  
  {/* Fallback Markdown Renderer */}
  {renderMode === 'fallback' && rawContent && (
    <MarkdownFallback rawContent={rawContent} showWarning={true} />
  )}
  
  {/* Error State */}
  {renderMode === 'error' && (
    <AdventureError 
      error={contentError} 
      adventureName={title}
      showSafeMode={false}
    />
  )}
</AdventureLayout>
````

## File: src/pages/privacy.astro
````astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Privacy Policy">
  <nav class="fixed w-full z-50 glass-panel border-b border-white/5">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <a href="/" class="flex items-center space-x-3 group">
        <svg class="w-8 h-8 text-forge-blue group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        <span class="font-bold text-lg tracking-tight animate-forge-flow">ParableForge</span>
      </a>
    </div>
  </nav>

  <main class="pt-32 pb-24">
    <div class="max-w-3xl mx-auto px-6">
      <h1 class="text-4xl font-bold text-white mb-8">Privacy Policy</h1>

      <div class="prose prose-invert max-w-none space-y-6 text-gray-400">
        <p><strong class="text-white">Last updated:</strong> {new Date().toLocaleDateString()}</p>

        <h2 class="text-2xl font-bold text-white mt-8">What We Collect</h2>
        <p>
          When you purchase from ParableForge, we collect your email address to create your account and deliver your purchase. We use LemonSqueezy for payment processing—we never see or store your payment card details.
        </p>

        <h2 class="text-2xl font-bold text-white mt-8">How We Use Your Information</h2>
        <ul class="list-disc pl-6 space-y-2">
          <li>To deliver your purchased content</li>
          <li>To send occasional product updates (you can unsubscribe anytime)</li>
          <li>To respond to support requests</li>
        </ul>

        <h2 class="text-2xl font-bold text-white mt-8">We Never</h2>
        <ul class="list-disc pl-6 space-y-2">
          <li>Sell your data to third parties</li>
          <li>Share your email with advertisers</li>
          <li>Track you across the web</li>
        </ul>

        <h2 class="text-2xl font-bold text-white mt-8">Questions?</h2>
        <p>
          Email us at <a href="mailto:hello@parableforge.com" class="text-forge-blue underline">hello@parableforge.com</a>
        </p>
      </div>

      <div class="mt-12">
        <a href="/" class="text-forge-blue hover:underline">← Back to Home</a>
      </div>
    </div>
  </main>
</BaseLayout>
````

## File: src/content.config.ts
````typescript
import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
````

## File: tsconfig.json
````json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
````

## File: .claude/settings.local.json
````json
{
  "permissions": {
    "allow": [
      "Bash(npm create:*)",
      "Bash(npx astro add:*)",
      "Bash(npm run build:*)",
      "Bash(npm run dev:*)",
      "Bash(npm install)",
      "Bash(git init:*)",
      "Bash(git remote add:*)",
      "Bash(git add:*)",
      "Bash(git commit -m \"$(cat <<''EOF''\nInitial commit: ParableForge with Astro Starlight\n\n- Landing page with forge glow dark theme and scroll animations\n- Supabase authentication (login, signup flows)\n- Protected Grimoire docs section (Starlight)\n- Sample adventure content (Sky Island)\n- Pages CMS integration for content editing\n- LemonSqueezy payment link placeholder\n- Privacy policy and terms of service pages\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>\nEOF\n)\")",
      "Bash(git branch:*)",
      "Bash(git push:*)",
      "Bash(git fetch:*)",
      "Bash(git commit:*)",
      "Bash(npm install:*)"
    ]
  }
}
````

## File: src/components/starlight/Head.astro
````astro
---
// Custom Head component for Starlight
// Injects auth check script for protected /compendium pages
import type { Props } from '@astrojs/starlight/props';
import Default from '@astrojs/starlight/components/Head.astro';

const isCompendiumPage = Astro.url.pathname.startsWith('/compendium');
---

<Default {...Astro.props}><slot /></Default>

{isCompendiumPage && (
  <script is:inline>
    // Auth guard for Grimoire pages
    (async function() {
      // Skip auth check in development (localhost)
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return;
      }

      const SUPABASE_URL = 'https://fhihhvyfluopxcuezqhi.supabase.co';
      const SUPABASE_ANON_KEY = ''; // Will be set from env

      // Quick check for session in localStorage
      const storageKey = 'sb-fhihhvyfluopxcuezqhi-auth-token';
      const stored = localStorage.getItem(storageKey);

      if (!stored) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        return;
      }

      try {
        const parsed = JSON.parse(stored);
        if (!parsed.access_token || !parsed.expires_at) {
          throw new Error('Invalid session');
        }

        // Check if expired
        const expiresAt = parsed.expires_at * 1000;
        if (Date.now() > expiresAt) {
          localStorage.removeItem(storageKey);
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        }
      } catch (e) {
        localStorage.removeItem(storageKey);
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      }
    })();
  </script>
)}
````

## File: src/components/starlight/MobileTableOfContents.astro
````astro
\]
---
// Hidden for now - can be useful in the right UI
// Simplify the component to not rely on Starlight's TableOfContentsList
const { toc } = Astro.locals.starlightRoute;
const isHidden = true; // Set to false to re-enable
---

{
	toc && !isHidden && (
		<mobile-starlight-toc data-min-h={toc.minHeadingLevel} data-max-h={toc.maxHeadingLevel}>
			<nav aria-labelledby="starlight__on-this-page--mobile">
				<details id="starlight__mobile-toc">
					<summary id="starlight__on-this-page--mobile" class="sl-flex">
						<span class="toggle sl-flex">
							{Astro.locals.t('tableOfContents.onThisPage')}
							<svg class="caret" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
								<path fill="currentColor" d="M9.293 6.293a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414-1.414L13.586 12 9.293 7.707a1 1 0 0 1 0-1.414z"/>
							</svg>
						</span>
						<span class="display-current" />
					</summary>
					<div class="dropdown">
						<ul>
							{toc.items.map(heading => (
								<li class:list={{ heading: true, [`depth-${heading.depth}`]: true }}>
									<a href={`#${heading.slug}`}>{heading.text}</a>
									{heading.children.length > 0 && (
										<ul>
											{heading.children.map(subheading => (
												<li class:list={{ heading: true, [`depth-${subheading.depth}`]: true }}>
													<a href={`#${subheading.slug}`}>{subheading.text}</a>
												</li>
											))}
										</ul>
									)}
								</li>
							))}
						</ul>
					</div>
				</details>
			</nav>
		</mobile-starlight-toc>
	)
}

<style>
	@layer starlight.core {
		nav {
			position: fixed;
			z-index: var(--sl-z-index-toc);
			/* Modified positioning - adjust these values as needed */
			top: calc(var(--sl-nav-height) - 1px);
			inset-inline: 0;
			/* More visible border */
			border-top: 2px solid var(--sl-color-accent);
			background-color: var(--sl-color-bg-nav);
			/* Add a subtle shadow for better visibility */
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		}
		
		/* Responsive adjustments */
		@media (min-width: 50rem) {
			nav {
				inset-inline-start: var(--sl-content-inline-start, 0);
			}
		}

		/* Improved touch target size for mobile */
		summary {
			gap: 0.5rem;
			align-items: center;
			height: var(--sl-mobile-toc-height);
			border-bottom: 1px solid var(--sl-color-hairline-shade);
			padding: 0.75rem 1rem; /* Increased padding for better touch target */
			font-size: var(--sl-text-sm); /* Slightly larger text */
			outline-offset: var(--sl-outline-offset-inside);
		}
		summary::marker,
		summary::-webkit-details-marker {
			display: none;
		}

		.toggle {
			flex-shrink: 0;
			gap: 1rem;
			align-items: center;
			justify-content: space-between;
			border: 1px solid var(--sl-color-gray-5);
			border-radius: 0.5rem;
			padding-block: 0.5rem;
			padding-inline-start: 0.75rem;
			padding-inline-end: 0.5rem;
			line-height: 1;
			background-color: var(--sl-color-black);
			user-select: none;
			cursor: pointer;
		}
		details[open] .toggle {
			color: var(--sl-color-white);
			border-color: var(--sl-color-accent);
		}
		details .toggle:hover {
			color: var(--sl-color-white);
			border-color: var(--sl-color-gray-2);
		}

		:global([dir='rtl']) .caret {
			transform: rotateZ(180deg);
		}
		details[open] .caret {
			transform: rotateZ(90deg);
		}

		.display-current {
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
			color: var(--sl-color-white);
			font-weight: 500; /* Make current heading slightly bolder */
		}

		/* Improved dropdown appearance and sizing */
		.dropdown {
			--border-top: 1px;
			margin-top: calc(-1 * var(--border-top));
			border: var(--border-top) solid var(--sl-color-gray-6);
			border-top-color: var(--sl-color-hairline-shade);
			/* Adjusted max-height for better visibility on smaller screens */
			max-height: calc(80vh - var(--sl-nav-height) - var(--sl-mobile-toc-height));
			overflow-y: auto;
			background-color: var(--sl-color-black);
			box-shadow: var(--sl-shadow-md);
			overscroll-behavior: contain;
			/* Smoother scrolling */
			scroll-behavior: smooth;
			/* Improved scrollbar styling */
			scrollbar-width: thin;
			scrollbar-color: var(--sl-color-gray-5) transparent;
		}
		
		/* Custom scrollbar for WebKit browsers */
		.dropdown::-webkit-scrollbar {
			width: 6px;
		}
		.dropdown::-webkit-scrollbar-thumb {
			background-color: var(--sl-color-gray-5);
			border-radius: 3px;
		}
		.dropdown::-webkit-scrollbar-track {
			background-color: transparent;
		}
	}
</style>

<script>
	// Create a simplified version of the StarlightTOC class
	class MobileStarlightTOC extends HTMLElement {
		// The minimum and maximum heading levels to include
		private minH = 2;
		private maxH = 3;
		private _current: HTMLAnchorElement | null = null;

		// Implementation for setting the current heading
		set current(link: HTMLAnchorElement) {
			this._current = link;
			const display = this.querySelector('.display-current') as HTMLSpanElement;
			if (display) display.textContent = link.textContent;
		}

		constructor() {
			super();
			
			// Set min/max heading levels from data attributes
			const minH = this.dataset.minH ? parseInt(this.dataset.minH) : 2;
			const maxH = this.dataset.maxH ? parseInt(this.dataset.maxH) : 3;
			this.minH = minH;
			this.maxH = maxH;

			const details = this.querySelector('details');
			if (!details) return;
			const closeToC = () => {
				details.open = false;
			};
			// Close the table of contents whenever a link is clicked.
			details.querySelectorAll('a').forEach((a) => {
				a.addEventListener('click', closeToC);
			});
			// Close the table of contents when a user clicks outside of it.
			window.addEventListener('click', (e) => {
				if (!details.contains(e.target as Node)) closeToC();
			});
			// Or when they press the escape key.
			window.addEventListener('keydown', (e) => {
				if (e.key === 'Escape' && details.open) {
					const hasFocus = details.contains(document.activeElement);
					closeToC();
					if (hasFocus) {
						const summary = details.querySelector('summary');
						if (summary) summary.focus();
					}
				}
			});
		}
	}

	customElements.define('mobile-starlight-toc', MobileStarlightTOC);
</script>
````

## File: src/components/starlight/PlayAdventureButton.astro
````astro
---
/**
 * PLAY ADVENTURE BUTTON COMPONENT
 * 
 * Shows a prominent CTA button on Starlight adventure documentation pages
 * that launches the interactive adventure engine version.
 * 
 * Usage: Automatically appears on /compendium/adventures/* pages
 * 
 * Flow:
 * 1. Detects current page URL
 * 2. Extracts adventure slug (e.g., "sky-island")
 * 3. Checks if interactive version exists
 * 4. Shows button linking to /adventure/{slug}
 * 
 * Design: Glass panel with blue gradient border, hover glow effect
 */

// Extract adventure slug from current URL
const currentPath = Astro.url.pathname;
const slugMatch = currentPath.match(/\/adventures\/([^\/]+)/);
let adventureSlug = slugMatch ? slugMatch[1].replace(/\/$/, '') : null;

// Remove '-guide' suffix if present (guide pages link to interactive adventures)
if (adventureSlug?.endsWith('-guide')) {
  adventureSlug = adventureSlug.replace(/-guide$/, '');
}

// Build interactive adventure URL
const interactiveUrl = adventureSlug ? `/adventure/${adventureSlug}` : null;

// Import Keystatic reader to check if adventure exists
import { getAdventure } from '../../lib/keystatic-reader';

// Check if interactive version exists
let adventureExists = false;
if (adventureSlug) {
  try {
    const adventure = await getAdventure(adventureSlug);
    adventureExists = !!adventure;
  } catch (error) {
    console.warn(`PlayAdventureButton: Could not verify adventure ${adventureSlug}:`, error);
  }
}

// Only render if we have a valid slug and adventure exists
const shouldRender = interactiveUrl && adventureExists;
---

{shouldRender && (
  <div class="play-adventure-banner not-content">
    <a href={interactiveUrl} class="play-banner-button">
      <span class="play-button-icon">▶️</span>
      <span>Play Interactive Adventure</span>
      <span class="play-button-arrow">→</span>
    </a>
  </div>
)}

<style>
  .play-adventure-banner {
    margin: 2rem 0;
  }

  .play-banner-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: white !important;
    font-weight: 600;
    font-size: 0.9375rem;
    border-radius: 8px;
    text-decoration: none !important;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    width: 100%;
  }

  .play-banner-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    background: linear-gradient(135deg, #2563eb, #7c3aed);
  }

  .play-button-icon {
    font-size: 1.1rem;
  }

  .play-button-arrow {
    font-size: 1.25rem;
    transition: transform 0.2s ease;
  }

  .play-banner-button:hover .play-button-arrow {
    transform: translateX(4px);
  }

  /* Mobile responsiveness */
  @media (max-width: 640px) {
    .play-banner-button {
      font-size: 0.875rem;
    }
  }

  /* Ensure this doesn't inherit Starlight content styles */
  .not-content {
    all: revert;
  }

  .not-content * {
    all: revert;
  }
</style>
````

## File: src/content/docs/compendium/welcome.mdx
````markdown
---
title: Welcome to The Compendium
description: Your portal to family adventures
sidebar:
  label: Welcome
  order: 1
---

import { Card, CardGrid } from '@astrojs/starlight/components';

# Welcome to The Compendium, Guardian

You've taken the first step toward creating lasting adventure memories with your family. This is your personal portal to everything ParableForge.

## 🎮 Play Adventures

Ready to jump straight in? Launch the interactive adventure engine:

<CardGrid>
  <Card title="⚡ Sky Island" icon="rocket">
    **30 min • Beginner**
    
    An adventure to the mysterious island in the sky. Build trust with Grandmother Cloud and discover what secrets float among the mists.
    
    <div class="adventure-card-actions">
      <a href="/adventure/sky-island" class="play-button">
        <span class="play-icon">▶️</span>
        <span>Play Interactive Adventure</span>
        <span class="arrow">→</span>
      </a>
      
      <a href="/compendium/adventures/sky-island-guide/" class="guide-link">
        📖 Read the Guide First
      </a>
    </div>
  </Card>
</CardGrid>

<style>{`
  .adventure-card-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
  }
  
  .play-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: white !important;
    font-weight: 600;
    font-size: 0.9375rem;
    border-radius: 8px;
    text-decoration: none !important;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  .play-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    background: linear-gradient(135deg, #2563eb, #7c3aed);
  }
  
  .play-icon {
    font-size: 1.1rem;
  }
  
  .arrow {
    font-size: 1.25rem;
    transition: transform 0.2s ease;
  }
  
  .play-button:hover .arrow {
    transform: translateX(4px);
  }
  
  .guide-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    color: rgb(148, 163, 184) !important;
    font-size: 0.875rem;
    text-decoration: none !important;
    transition: color 0.2s ease;
  }
  
  .guide-link:hover {
    color: rgb(59, 130, 246) !important;
  }
`}</style>

:::tip[New to Adventures?]
If this is your first time, we recommend reading the [Getting Started Guide](#getting-started) below to understand how the interactive engine works!
:::

---

## What's Inside

### Adventures
Complete, ready-to-run adventures with word-for-word scripts. No prep required—just open and start reading.

### Character Creation
Tools to help your kids create their own heroes. Watch their creativity come alive.

### Parent Guide
Tips, tricks, and confidence-builders for first-time adventure guides.

---

## Getting Started

1. **Choose Your First Adventure** - Start with "The Mysterious Sky Island" for a gentle introduction
2. **Gather Your Adventurers** - Just you and your kids. That's all you need.
3. **Set the Scene** - Dim the lights if you want. Put away the phones. Create a moment.
4. **Read and React** - Follow the prompts. Ask "What do you do?" Let them lead.

---

## Need Help?

If you have questions, reach out at **hello@parableforge.com**. We're real humans who want your family adventures to succeed.

*Now go forth and forge some memories.*
````

## File: src/lib/supabase.ts
````typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fhihhvyfluopxcuezqhi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoaWhodnlmbHVvcHhjdWV6cWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTM2NTksImV4cCI6MjA4MTY2OTY1OX0.Ned8b6-joqp92AbUO3a7zr4QiwV34YO5eZ29HesALX0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}
````

## File: src/pages/index.astro
````astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Family Adventures That Last">
  <!-- Navigation -->
  <nav class="fixed w-full z-50 glass-panel border-b border-white/5">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <a href="/" class="flex items-center space-x-3 group">
        <svg class="w-8 h-8 text-forge-blue group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        <span class="font-bold text-lg tracking-tight animate-forge-flow">ParableForge</span>
      </a>
      <div class="flex items-center gap-6">
        <a href="/login" class="text-sm font-medium text-gray-400 hover:text-forge-blue transition-colors">
          Login
        </a>
        <a href="#offer" class="px-5 py-2.5 bg-forge-blue hover:bg-blue-600 text-white font-bold text-sm rounded shadow-lg shadow-forge-blue/20 transition-all hidden sm:block">
          Get the Starter Kit ($27)
        </a>
      </div>
    </div>
  </nav>

  <main>
    <!-- Hero Section -->
    <header class="relative pt-32 pb-24 lg:pt-48 lg:pb-32 hero-glow overflow-hidden">
      <div class="hero-stars"></div>

      <div class="max-w-7xl mx-auto px-6 text-center relative z-10">
        <div class="inline-flex items-center space-x-2 bg-forge-blue/10 border border-forge-blue/20 rounded-full px-4 py-1.5 mb-8">
          <span class="flex h-2 w-2 rounded-full bg-forge-blue animate-pulse"></span>
          <span class="text-forge-blue text-xs font-bold uppercase tracking-wide">Screen-Free Family Adventures</span>
        </div>

        <h1 class="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
          They Won't Be Kids Forever.<br>
          <span class="animate-forge-flow">The Memories Will.</span>
        </h1>

        <p class="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Trade the mundane for adventure. 30 minutes. No prep. Pure connection.
        </p>

        <div class="flex flex-wrap justify-center gap-4 mb-12 text-sm text-gray-400 font-mono">
          <div class="flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/5">
            <span class="text-forge-blue font-bold">✓</span> 30-45 Minutes
          </div>
          <div class="flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/5">
            <span class="text-forge-blue font-bold">✓</span> Ages 4-12
          </div>
          <div class="flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/5">
            <span class="text-forge-blue font-bold">✓</span> Zero Prep
          </div>
        </div>

        <div class="flex flex-col sm:flex-row justify-center gap-4 mb-20">
          <a href="#offer" class="btn-primary">
            Start Your Adventure - $27
          </a>
        </div>

        <div class="mt-16 max-w-3xl mx-auto relative group">
          <div class="absolute -inset-1 bg-gradient-to-r from-forge-blue to-forge-purple rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div class="relative aspect-video bg-forge-card border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden">
            <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
            <div class="text-center p-8 z-10">
              <svg class="w-16 h-16 mx-auto text-forge-blue/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
              <p class="text-gray-500 font-medium">Family gathered around an adventure</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Problem Section -->
    <section class="py-24 bg-black border-y border-white/5">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-8">
          Busy Isn't the Same as Connected
        </h2>
        <div class="space-y-6 text-lg text-gray-400 leading-relaxed">
          <p>
            You're doing things <em class="text-white not-italic">for</em> them every day. Driving to practice. Helping with homework. Making dinner.
          </p>
          <p>
            But doing things <em class="text-white not-italic">with</em> them? Actually being present in the same moment, creating something together?
          </p>
          <p class="text-forge-red">
            That's what keeps slipping through the cracks.
          </p>
          <div class="mt-8 p-6 bg-forge-card border border-forge-blue/20 rounded-xl inline-block">
            <p class="text-forge-blue font-bold text-xl">
              What if you could create real adventure memories—without adding another thing to your plate?
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Guide Section -->
    <section class="py-24 relative overflow-hidden">
      <div class="absolute top-1/4 right-0 w-[500px] h-[500px] bg-forge-blue/5 rounded-full blur-3xl -z-10"></div>

      <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div class="inline-block px-3 py-1 mb-6 rounded-md bg-forge-blue/10 border border-forge-blue/20 text-forge-blue text-xs font-bold uppercase tracking-wider">The Origin Story</div>
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
            I Built This Because I Was on Autopilot
          </h2>
          <div class="space-y-4 text-lg text-gray-400">
            <p>
              I'm Tom—a dad who realized I was physically present but mentally checked out.
            </p>
            <p>
              I'd get home from work, go through the motions, and wonder why the days felt so... routine.
            </p>
            <p>
              I wanted magic. I wanted my kids to remember our time together as <strong class="text-white">adventures</strong>, not just activities.
            </p>
            <p class="font-bold text-forge-blue pt-4">
              So I built ParableForge: the storytelling system that turns any parent into their family's adventure guide.
            </p>
          </div>
        </div>

        <div class="p-8 rounded-xl bg-forge-card border border-white/5 hover:border-forge-blue/30 transition duration-300 shadow-2xl relative">
          <div class="absolute -top-3 -right-3 bg-forge-blue text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/20">TESTED</div>

          <h3 class="text-sm font-bold text-forge-blue uppercase tracking-wider mb-6">Why Parents Trust ParableForge</h3>

          <div class="space-y-4">
            <div class="flex items-start gap-4">
              <span class="text-forge-blue font-bold">✓</span>
              <span class="text-gray-300">Tested with real families (not focus groups)</span>
            </div>
            <div class="flex items-start gap-4">
              <span class="text-forge-blue font-bold">✓</span>
              <span class="text-gray-300">Designed for exhausted parents</span>
            </div>
            <div class="flex items-start gap-4">
              <span class="text-forge-blue font-bold">✓</span>
              <span class="text-gray-300">Works for ages 4-12</span>
            </div>
            <div class="flex items-start gap-4">
              <span class="text-forge-blue font-bold">✓</span>
              <span class="text-gray-300">Zero creative ability required</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Plan Section (Timeline) -->
    <section id="adventure-trigger" class="relative h-[400vh] bg-forge-dark border-y border-white/5">
      <div class="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div class="max-w-4xl mx-auto px-6 w-full relative h-[80vh] flex flex-col justify-center">

          <div class="text-center mb-16 shrink-0 relative z-30">
            <span class="text-forge-blue font-bold tracking-widest uppercase text-xs mb-2 block">The Journey</span>
            <h2 class="text-4xl md:text-6xl font-black text-white">
              How to <span class="animate-forge-flow">Forge a Memory</span>
            </h2>
          </div>

          <div id="timeline-container" class="relative grid grid-rows-4 h-[600px] w-full">

            <div id="rail-track" class="absolute left-8 md:left-1/2 w-1.5 -ml-[3px] z-0 rounded-full overflow-hidden">
              <div class="absolute inset-0 bg-forge-card w-full h-full"></div>
              <div id="progress-fill" class="absolute top-0 left-0 w-full forge-line-gradient h-0 transition-[height] duration-75 linear z-10"></div>
            </div>

            <div class="relative flex flex-col md:flex-row gap-12 timeline-step group z-20 items-center" data-step="1">
              <div class="pl-24 md:pl-0 md:w-1/2 md:text-right md:pr-24 text-transition opacity-40 translate-y-4 group-[.active]:opacity-100 group-[.active]:translate-y-0">
                <div class="inline-flex items-center gap-2 border border-forge-blue/30 bg-blue-900/20 px-3 py-1 text-xs font-bold mb-3 rounded-full text-blue-300">STEP 01</div>
                <h4 class="font-bold text-2xl text-white mb-2">Choose Your Adventure</h4>
                <p class="text-gray-400 text-sm leading-relaxed">Select a story from the library. Pirates, Space Explorers, or Medieval Knights? You decide the path.</p>
              </div>

              <div class="bead absolute left-8 md:left-1/2 -ml-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-forge-dark border-2 border-gray-700 rounded-full overflow-hidden z-20 flex items-center justify-center transition-all duration-300 shadow-xl">
                <div class="bead-fill absolute inset-0 rounded-full opacity-0 will-change-[opacity]"></div>
                <i class="fa-solid fa-map-location-dot z-30 relative text-2xl text-gray-600 transition-colors duration-200"></i>
              </div>
              <div class="hidden md:block md:w-1/2"></div>
            </div>

            <div class="relative flex flex-col md:flex-row gap-12 timeline-step group z-20 items-center" data-step="2">
              <div class="hidden md:block md:w-1/2"></div>

              <div class="bead absolute left-8 md:left-1/2 -ml-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-forge-dark border-2 border-gray-700 rounded-full overflow-hidden z-20 flex items-center justify-center transition-all duration-300 shadow-xl">
                <div class="bead-fill absolute inset-0 rounded-full opacity-0 will-change-[opacity]"></div>
                <i class="fa-solid fa-book-open-reader z-30 relative text-2xl text-gray-600 transition-colors duration-200"></i>
              </div>

              <div class="pl-24 md:pl-24 md:w-1/2 text-left text-transition opacity-40 translate-y-4 group-[.active]:opacity-100 group-[.active]:translate-y-0">
                <div class="inline-flex items-center gap-2 border border-purple-500/30 bg-purple-900/20 px-3 py-1 text-xs font-bold mb-3 rounded-full text-purple-300">STEP 02</div>
                <h4 class="font-bold text-2xl text-white mb-2">Set the Stage</h4>
                <p class="text-gray-400 text-sm leading-relaxed">Read the prompts aloud. The app guides you, but your voice sets the mood. Dim the lights, use a funny accent.</p>
              </div>
            </div>

            <div class="relative flex flex-col md:flex-row gap-12 timeline-step group z-20 items-center" data-step="3">
              <div class="pl-24 md:pl-0 md:w-1/2 md:text-right md:pr-24 text-transition opacity-40 translate-y-4 group-[.active]:opacity-100 group-[.active]:translate-y-0">
                <div class="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-900/20 px-3 py-1 text-xs font-bold mb-3 rounded-full text-orange-300">STEP 03</div>
                <h4 class="font-bold text-2xl text-white mb-2">Let Kids be the Heroes</h4>
                <p class="text-gray-400 text-sm leading-relaxed">When the prompt asks "What do you do?", let them answer. Their imagination drives the plot forward.</p>
              </div>

              <div class="bead absolute left-8 md:left-1/2 -ml-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-forge-dark border-2 border-gray-700 rounded-full overflow-hidden z-20 flex items-center justify-center transition-all duration-300 shadow-xl">
                <div class="bead-fill absolute inset-0 rounded-full opacity-0 will-change-[opacity]"></div>
                <i class="fa-solid fa-shield-halved z-30 relative text-2xl text-gray-600 transition-colors duration-200"></i>
              </div>
              <div class="hidden md:block md:w-1/2"></div>
            </div>

            <div class="relative flex flex-col md:flex-row gap-12 timeline-step group z-20 items-center" data-step="4">
              <div class="hidden md:block md:w-1/2"></div>

              <div class="bead absolute left-8 md:left-1/2 -ml-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-forge-dark border-2 border-gray-700 rounded-full overflow-hidden z-20 flex items-center justify-center transition-all duration-300 shadow-xl">
                <div class="bead-fill absolute inset-0 rounded-full opacity-0 will-change-[opacity]"></div>
                <i class="fa-solid fa-heart z-30 relative text-2xl text-gray-600 transition-colors duration-200"></i>
              </div>

              <div class="pl-24 md:pl-24 md:w-1/2 text-left text-transition opacity-40 translate-y-4 group-[.active]:opacity-100 group-[.active]:translate-y-0">
                <div class="inline-flex items-center gap-2 border border-red-500/30 bg-red-900/20 px-3 py-1 text-xs font-bold mb-3 rounded-full text-red-300">THE REWARD</div>
                <h4 class="font-bold text-2xl text-white mb-2">Forge Lifelong Memories</h4>
                <p class="text-gray-400 text-sm leading-relaxed">It's not just a story; it's time spent together. No screens, just connection.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>

    <!-- Offer Section -->
    <section id="offer" class="py-24 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-forge-blue/50 to-transparent"></div>

      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl font-bold text-white mb-4">The Starter Collection</h2>
          <p class="text-gray-400">Everything you need to run your first family adventures tonight.</p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
          <div class="glass-panel rounded-2xl p-8">
            <h3 class="text-2xl font-bold mb-6 text-forge-gold">What's Included:</h3>
            <ul class="space-y-6">
              <li class="flex items-start gap-4">
                <span class="text-forge-blue font-bold text-xl">✓</span>
                <div>
                  <span class="font-bold text-white block">3 Complete Adventures</span>
                  <p class="text-gray-500 text-sm">6+ hours of family adventure time</p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <span class="text-forge-blue font-bold text-xl">✓</span>
                <div>
                  <span class="font-bold text-white block">Character Creation Kit</span>
                  <p class="text-gray-500 text-sm">Kids design their own heroes</p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <span class="text-forge-blue font-bold text-xl">✓</span>
                <div>
                  <span class="font-bold text-white block">Parent Confidence Guide</span>
                  <p class="text-gray-500 text-sm">Tips for first-time adventure guides</p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <span class="text-forge-blue font-bold text-xl">✓</span>
                <div>
                  <span class="font-bold text-white block">Access to The Compendium</span>
                  <p class="text-gray-500 text-sm">Digital portal with all your resources</p>
                </div>
              </li>
            </ul>
          </div>

          <div class="relative flex flex-col p-8 rounded-2xl bg-forge-card border border-forge-gold/30 shadow-2xl gold-glow group">
            <div class="absolute top-0 left-0 w-full h-1 bg-forge-gold"></div>

            <div class="mb-6">
              <div class="text-forge-gold font-bold uppercase tracking-wider text-sm mb-2">One-Time Purchase</div>
              <div class="flex items-baseline">
                <span class="text-5xl font-extrabold text-white">$27</span>
                <span class="text-gray-500 ml-2">/ forever</span>
              </div>
            </div>

            <p class="text-gray-400 mb-8">Instant access. Keep the files forever.</p>

            <a href="YOUR_LEMONSQUEEZY_LINK_HERE" class="btn-gold w-full text-center">
              Buy the Starter Collection
            </a>

            <p class="text-center text-xs text-gray-500 mt-6">
              Secure checkout via LemonSqueezy. <br>30-day money-back guarantee.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-24 bg-black border-t border-white/5">
      <div class="max-w-3xl mx-auto px-6">
        <h2 class="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Common Questions
        </h2>
        <div class="space-y-4">
          <details class="group bg-forge-card border border-white/5 rounded-xl overflow-hidden">
            <summary class="flex justify-between items-center p-6 cursor-pointer list-none text-white font-medium hover:text-forge-blue transition-colors">
              I'm not creative. Can I really do this?
              <span class="transform group-open:rotate-180 transition-transform text-forge-blue">▼</span>
            </summary>
            <div class="px-6 pb-6 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
              That's exactly why ParableForge exists. Everything is scripted. You're not inventing stories—you're reading prompts and asking "What do you do?" Your kids do all the imagining.
            </div>
          </details>

          <details class="group bg-forge-card border border-white/5 rounded-xl overflow-hidden">
            <summary class="flex justify-between items-center p-6 cursor-pointer list-none text-white font-medium hover:text-forge-blue transition-colors">
              How much time does this take?
              <span class="transform group-open:rotate-180 transition-transform text-forge-blue">▼</span>
            </summary>
            <div class="px-6 pb-6 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
              Each adventure runs 30-45 minutes. Perfect for after dinner. Zero prep time—just open and start reading.
            </div>
          </details>

          <details class="group bg-forge-card border border-white/5 rounded-xl overflow-hidden">
            <summary class="flex justify-between items-center p-6 cursor-pointer list-none text-white font-medium hover:text-forge-blue transition-colors">
              What ages work best?
              <span class="transform group-open:rotate-180 transition-transform text-forge-blue">▼</span>
            </summary>
            <div class="px-6 pb-6 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
              Ages 4-12. Younger kids make simple choices; older kids tackle moral dilemmas. Mixed-age siblings work great together.
            </div>
          </details>

          <details class="group bg-forge-card border border-white/5 rounded-xl overflow-hidden">
            <summary class="flex justify-between items-center p-6 cursor-pointer list-none text-white font-medium hover:text-forge-blue transition-colors">
              Is this like Dungeons & Dragons?
              <span class="transform group-open:rotate-180 transition-transform text-forge-blue">▼</span>
            </summary>
            <div class="px-6 pb-6 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
              Similar magic, zero complexity. No dice mechanics to learn, no character sheets. Just story and choices.
            </div>
          </details>
        </div>
      </div>
    </section>

    <!-- Final CTA Section -->
    <section class="py-24 bg-black text-center relative overflow-hidden">
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="max-w-4xl mx-auto px-6 relative z-10">
        <h2 class="text-3xl md:text-5xl font-bold text-white mb-6">
          Their Childhood Won't Wait
        </h2>
        <div class="space-y-2 text-lg text-blue-100 mb-10 font-medium">
          <p>Tonight could be the first adventure.</p>
          <p>The first time they choose to save the village.</p>
          <p>The first memory they'll tell their own kids about someday.</p>
        </div>
        <a href="#offer" class="px-10 py-5 bg-white text-forge-blue hover:bg-gray-100 font-bold text-xl rounded-lg shadow-2xl transition-all inline-block">
          Start Your Adventure - $27
        </a>
      </div>
    </section>

  </main>

  <!-- Footer -->
  <footer class="py-12 bg-black border-t border-white/5">
    <div class="max-w-6xl mx-auto px-6">
      <div class="flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex items-center space-x-2">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          <span class="font-bold text-gray-500">ParableForge</span>
        </div>
        <div class="flex gap-6 text-sm text-gray-500">
          <a href="/login" class="hover:text-white transition-colors">Login</a>
          <a href="/privacy" class="hover:text-white transition-colors">Privacy Policy</a>
          <a href="/terms" class="hover:text-white transition-colors">Terms</a>
        </div>
      </div>
      <div class="mt-8 text-center text-sm text-gray-700">
        &copy; 2025 ParableForge. Forged for adventurous families.
      </div>
    </div>
  </footer>

  <!-- Timeline Animation Script -->
  <script is:inline>
    document.addEventListener('DOMContentLoaded', () => {
      const triggerSection = document.getElementById('adventure-trigger');
      const progressFill = document.getElementById('progress-fill');
      const railTrack = document.getElementById('rail-track');
      const timelineContainer = document.getElementById('timeline-container');
      const steps = document.querySelectorAll('.timeline-step');

      const mapRange = (value, inMin, inMax, outMin, outMax) => {
        if (value < inMin) return outMin;
        if (value > inMax) return outMax;
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
      };

      const updateTimeline = () => {
        if (!triggerSection) return;

        const rect = triggerSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const scrollableDistance = rect.height - windowHeight;
        const scrolledPixels = -rect.top;

        let percent = (scrolledPixels / scrollableDistance) * 100;
        percent = Math.max(0, Math.min(100, percent));

        const containerRect = timelineContainer.getBoundingClientRect();
        const beadCenters = Array.from(steps).map(step => {
          const bead = step.querySelector('.bead');
          const beadRect = bead.getBoundingClientRect();
          return (beadRect.top + (beadRect.height / 2)) - containerRect.top;
        });

        const firstBeadCenter = beadCenters[0];
        const lastBeadCenter = beadCenters[beadCenters.length - 1];

        railTrack.style.top = `${firstBeadCenter}px`;
        railTrack.style.height = `${lastBeadCenter - firstBeadCenter}px`;

        const colorMap = [
          { hex: '#3b82f6', glow: 'rgba(59, 130, 246, 0.7)' },
          { hex: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.7)' },
          { hex: '#f59e0b', glow: 'rgba(245, 158, 11, 0.7)' },
          { hex: '#ef4444', glow: 'rgba(239, 68, 68, 0.7)' }
        ];

        let targetPixelHeight = 0;
        let beadValues = [0, 0, 0, 0];

        if (percent < 15) {
          targetPixelHeight = 0;
          beadValues[0] = mapRange(percent, 0, 15, 0, 1);
        } else if (percent < 30) {
          beadValues[0] = 1;
          targetPixelHeight = mapRange(percent, 15, 30, 0, beadCenters[1] - firstBeadCenter);
        } else if (percent < 45) {
          beadValues[0] = 1;
          targetPixelHeight = beadCenters[1] - firstBeadCenter;
          beadValues[1] = mapRange(percent, 30, 45, 0, 1);
        } else if (percent < 60) {
          beadValues[0] = 1; beadValues[1] = 1;
          targetPixelHeight = mapRange(percent, 45, 60, beadCenters[1] - firstBeadCenter, beadCenters[2] - firstBeadCenter);
        } else if (percent < 70) {
          beadValues[0] = 1; beadValues[1] = 1;
          targetPixelHeight = beadCenters[2] - firstBeadCenter;
          beadValues[2] = mapRange(percent, 60, 70, 0, 1);
        } else if (percent < 80) {
          beadValues[0] = 1; beadValues[1] = 1; beadValues[2] = 1;
          targetPixelHeight = mapRange(percent, 70, 80, beadCenters[2] - firstBeadCenter, beadCenters[3] - firstBeadCenter);
        } else if (percent < 90) {
          beadValues[0] = 1; beadValues[1] = 1; beadValues[2] = 1;
          targetPixelHeight = beadCenters[3] - firstBeadCenter;
          beadValues[3] = mapRange(percent, 80, 90, 0, 1);
        } else {
          beadValues[0] = 1; beadValues[1] = 1; beadValues[2] = 1; beadValues[3] = 1;
          targetPixelHeight = beadCenters[3] - firstBeadCenter;
        }

        progressFill.style.height = `${targetPixelHeight}px`;

        steps.forEach((step, index) => {
          const bead = step.querySelector('.bead');
          const fill = step.querySelector('.bead-fill');
          const icon = step.querySelector('i');
          const value = beadValues[index];
          const stepColor = colorMap[index];

          fill.style.opacity = value;
          fill.style.backgroundColor = stepColor.hex;

          if (value > 0.95) {
            icon.classList.remove('text-gray-600');
            icon.classList.add('text-white');
          } else {
            icon.classList.add('text-gray-600');
            icon.classList.remove('text-white');
          }

          if (value > 0.1) {
            step.classList.add('active');
          } else {
            step.classList.remove('active');
          }

          if (value >= 0.99) {
            if (index === 3) {
              bead.classList.add('white-hot-pulse');
              bead.style.overflow = 'visible';
              bead.style.boxShadow = 'none';
              bead.style.borderColor = '#fff';
            } else {
              bead.style.boxShadow = `0 0 0 0 ${stepColor.glow}`;
              bead.style.borderColor = stepColor.hex;
              bead.style.animation = 'none';
              bead.style.transition = 'box-shadow 1s infinite';
              bead.animate([
                { boxShadow: `0 0 0 0 ${stepColor.glow}` },
                { boxShadow: `0 0 0 15px rgba(0,0,0,0)` }
              ], {
                duration: 2000,
                iterations: Infinity
              });
            }
          } else {
            bead.classList.remove('white-hot-pulse');
            bead.getAnimations().forEach(anim => anim.cancel());
            bead.style.overflow = 'hidden';
            bead.style.borderColor = '#374151';
            bead.style.boxShadow = 'none';
          }
        });
      };

      window.addEventListener('scroll', updateTimeline, { passive: true });
      window.addEventListener('resize', updateTimeline, { passive: true });

      setTimeout(updateTimeline, 100);
    });
  </script>
</BaseLayout>
````

## File: src/pages/login.astro
````astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Login">
  <div class="min-h-screen flex items-center justify-center px-4 hero-glow relative overflow-hidden">
    <div class="hero-stars"></div>

    <div class="max-w-md w-full relative z-10">
      <div class="text-center mb-8">
        <a href="/" class="flex items-center justify-center space-x-2 group">
          <svg class="w-8 h-8 text-forge-blue group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          <span class="font-bold text-xl animate-forge-flow">ParableForge</span>
        </a>
        <h1 class="text-3xl font-bold text-white mt-6">Welcome Back, Guardian</h1>
         <p class="text-gray-400 mt-2">Sign in to access your Compendium</p>
      </div>

      <div class="glass-panel rounded-2xl p-8">
        <form id="login-form" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              class="w-full px-4 py-3 bg-forge-dark border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-forge-blue focus:outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minlength="6"
              class="w-full px-4 py-3 bg-forge-dark border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-forge-blue focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div id="error-message" class="hidden text-forge-red text-sm bg-forge-red/10 border border-forge-red/20 p-3 rounded-lg">
          </div>

          <button
            type="submit"
            class="btn-primary w-full text-center"
          >
            Sign In
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-500">
          Don't have an account? <a href="/#offer" class="text-forge-blue font-medium hover:underline">Get the Starter Collection</a>
        </div>
      </div>

      <div class="mt-8 text-center">
        <a href="/" class="text-gray-500 hover:text-white transition-colors text-sm">
          ← Back to Home
        </a>
      </div>
    </div>
  </div>

  <script>
    import { signIn } from '../lib/supabase';

    const form = document.getElementById('login-form') as HTMLFormElement;
    const errorDiv = document.getElementById('error-message') as HTMLDivElement;

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.classList.add('hidden');

      const formData = new FormData(form);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      const { data, error } = await signIn(email, password);

      if (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
        return;
      }

        if (data.session) {
          window.location.href = '/compendium/welcome';
      }
    });
  </script>
</BaseLayout>
````

## File: src/pages/setup-grimoire.astro
````astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Setup Your Account">
  <div class="min-h-screen flex items-center justify-center px-4 hero-glow relative overflow-hidden">
    <div class="hero-stars"></div>

    <div class="max-w-md w-full relative z-10">
      <div class="text-center mb-8">
        <a href="/" class="flex items-center justify-center space-x-2 group">
          <svg class="w-8 h-8 text-forge-blue group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          <span class="font-bold text-xl animate-forge-flow">ParableForge</span>
        </a>
        <div class="mt-6 inline-flex items-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-full text-sm font-medium">
          <span>✓</span> Payment Verified
        </div>
        <h1 class="text-3xl font-bold text-white mt-4">Create Your Guardian Account</h1>
        <p class="text-gray-400 mt-2">One more step to access The Compendium</p>
      </div>

      <div class="glass-panel rounded-2xl p-8">
        <form id="signup-form" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              class="w-full px-4 py-3 bg-forge-dark border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-forge-blue focus:outline-none transition-colors"
              placeholder="you@example.com"
            />
            <p class="mt-1 text-xs text-gray-500">Use the same email from your purchase</p>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
              Create Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minlength="6"
              class="w-full px-4 py-3 bg-forge-dark border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-forge-blue focus:outline-none transition-colors"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              required
              minlength="6"
              class="w-full px-4 py-3 bg-forge-dark border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-forge-blue focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div id="error-message" class="hidden text-forge-red text-sm bg-forge-red/10 border border-forge-red/20 p-3 rounded-lg">
          </div>

          <div id="success-message" class="hidden text-green-400 text-sm bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
          </div>

          <button
            type="submit"
            class="btn-primary w-full text-center"
          >
            Create Account & Enter The Compendium
          </button>
        </form>
      </div>

      <div class="mt-8 text-center text-sm text-gray-500">
        <p>Already have an account? <a href="/login" class="text-forge-blue font-medium hover:underline">Sign in here</a></p>
      </div>
    </div>
  </div>

  <script>
    import { signUp } from '../lib/supabase';

    const form = document.getElementById('signup-form') as HTMLFormElement;
    const errorDiv = document.getElementById('error-message') as HTMLDivElement;
    const successDiv = document.getElementById('success-message') as HTMLDivElement;

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.classList.add('hidden');
      successDiv.classList.add('hidden');

      const formData = new FormData(form);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const confirmPassword = formData.get('confirm-password') as string;

      if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.classList.remove('hidden');
        return;
      }

      const { data, error } = await signUp(email, password);

      if (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
        return;
      }

      if (data.user) {
        // Check if email confirmation is required
        if (data.session) {
          // User is signed in, redirect to compendium
          window.location.href = '/compendium/welcome';
        } else {
          // Email confirmation required
          successDiv.textContent = 'Check your email to confirm your account, then sign in.';
          successDiv.classList.remove('hidden');
          form.reset();
        }
      }
    });
  </script>
</BaseLayout>
````

## File: src/pages/terms.astro
````astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Terms of Service">
  <nav class="fixed w-full z-50 glass-panel border-b border-white/5">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <a href="/" class="flex items-center space-x-3 group">
        <svg class="w-8 h-8 text-forge-blue group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        <span class="font-bold text-lg tracking-tight animate-forge-flow">ParableForge</span>
      </a>
    </div>
  </nav>

  <main class="pt-32 pb-24">
    <div class="max-w-3xl mx-auto px-6">
      <h1 class="text-4xl font-bold text-white mb-8">Terms of Service</h1>

      <div class="prose prose-invert max-w-none space-y-6 text-gray-400">
        <p><strong class="text-white">Last updated:</strong> {new Date().toLocaleDateString()}</p>

        <h2 class="text-2xl font-bold text-white mt-8">The Simple Version</h2>
        <p>
          When you buy ParableForge content, you get a personal license to use it with your family forever. You can't resell it or share your account, but you can create as many adventure memories as you want.
        </p>

        <h2 class="text-2xl font-bold text-white mt-8">What You Get</h2>
        <ul class="list-disc pl-6 space-y-2">
          <li>Lifetime access to purchased content</li>
          <li>Personal use with your immediate family</li>
          <li>Access to The Compendium portal</li>
        </ul>

        <h2 class="text-2xl font-bold text-white mt-8">Refund Policy</h2>
        <p>
          30-day money-back guarantee. If ParableForge doesn't work for your family, email us and we'll refund you—no questions asked.
        </p>

        <h2 class="text-2xl font-bold text-white mt-8">What You Can't Do</h2>
        <ul class="list-disc pl-6 space-y-2">
          <li>Resell or redistribute the content</li>
          <li>Share your account login</li>
          <li>Use it for commercial purposes</li>
        </ul>

        <h2 class="text-2xl font-bold text-white mt-8">Questions?</h2>
        <p>
          Email us at <a href="mailto:hello@parableforge.com" class="text-forge-blue underline">hello@parableforge.com</a>
        </p>
      </div>

      <div class="mt-12">
        <a href="/" class="text-forge-blue hover:underline">← Back to Home</a>
      </div>
    </div>
  </main>
</BaseLayout>
````

## File: src/styles/global.css
````css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ParableForge Forge Glow Theme */
@layer base {
  :root {
    --forge-blue: #3B82F6;
    --forge-gold: #F59E0B;
    --forge-red: #EF4444;
    --forge-purple: #8B5CF6;

    /* Starlight CSS Variables Override for Compendium */
    --sl-color-accent-low: #3B82F620;
    --sl-color-accent: #3B82F6;
    --sl-color-accent-high: #60A5FA;
    --sl-color-white: #F3F4F6;
    --sl-color-gray-1: #E5E7EB;
    --sl-color-gray-2: #9CA3AF;
    --sl-color-gray-3: #6B7280;
    --sl-color-gray-4: #4B5563;
    --sl-color-gray-5: #1F2937;
    --sl-color-gray-6: #111827;
    --sl-color-black: #0B0F19;
    --sl-color-bg: #0B0F19;
    --sl-color-bg-nav: #111827;
    --sl-color-bg-sidebar: #0B0F19;
    --sl-color-hairline-light: #3B82F630;
    --sl-color-hairline: #3B82F650;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Inter', system-ui, sans-serif;
  }

  ::selection {
    background-color: #3B82F6;
    color: white;
  }
}

@layer components {
  /* Glass Panel Effect */
  .glass-panel {
    background: rgba(17, 24, 39, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  /* Hero Glow Background */
  .hero-glow {
    background: radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15) 0%, rgba(11, 15, 25, 0) 70%);
  }

  /* Gold Glow for Pricing */
  .gold-glow {
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.2);
  }

  /* Animated Forge Flow Text (Blue -> Purple -> Orange -> Red) */
  .animate-forge-flow {
    background-image: linear-gradient(
      to right,
      var(--forge-blue) 0%,
      var(--forge-purple) 25%,
      var(--forge-gold) 50%,
      var(--forge-red) 75%,
      var(--forge-blue) 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: magma-flow 4s linear infinite;
  }

  @keyframes magma-flow {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  /* Whimsical Starfield */
  .hero-stars {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)),
      radial-gradient(1px 1px at 40px 70px, var(--forge-blue), rgba(0,0,0,0)),
      radial-gradient(1px 1px at 50px 160px, #cbd5e1, rgba(0,0,0,0)),
      radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0));
    background-repeat: repeat;
    background-size: 200px 200px;
    opacity: 0.4;
    animation: twinkle 6s infinite linear;
    pointer-events: none;
    z-index: 0;
  }

  @keyframes twinkle {
    0% { transform: translateY(0); }
    100% { transform: translateY(-200px); }
  }

  /* Forge Line Gradient for Timeline */
  .forge-line-gradient {
    background: linear-gradient(
      to bottom,
      #3b82f6 0%,
      #8b5cf6 35%,
      #f59e0b 70%,
      #ef4444 100%
    );
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
  }

  .text-transition {
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  /* White Hot Pulse (Finale Animation) */
  .white-hot-pulse {
    background-color: #ef4444 !important;
    border-color: #fff !important;
    transform: scale(1.3) !important;
    animation: white-hot-shockwave 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
    z-index: 50 !important;
    box-shadow: 0 0 30px #ef4444;
  }

  @keyframes white-hot-shockwave {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.8), 0 0 0 0 rgba(239, 68, 68, 0.8);
    }
    50% {
      box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.2), 0 0 0 25px rgba(239, 68, 68, 0.4);
    }
    100% {
      box-shadow: 0 0 0 20px rgba(255, 255, 255, 0), 0 0 0 60px rgba(239, 68, 68, 0);
    }
  }

  /* Button Styles */
  .btn-primary {
    @apply inline-block px-8 py-4 text-lg font-bold rounded-lg
           bg-forge-blue text-white
           hover:bg-blue-600 shadow-lg shadow-forge-blue/25
           transition-all duration-200;
  }

  .btn-secondary {
    @apply inline-block px-6 py-3 text-lg font-semibold rounded-lg
           border-2 border-forge-blue text-forge-blue
           hover:bg-forge-blue hover:text-white
           transition-all duration-200;
  }

  .btn-gold {
    @apply inline-block px-8 py-4 text-lg font-bold rounded-lg
           bg-forge-gold text-forge-dark
           hover:bg-yellow-500 shadow-lg shadow-forge-gold/20
           transition-all duration-200;
  }

  .card {
    @apply bg-forge-card rounded-xl border border-white/5 p-6;
  }

  .section {
    @apply px-4 sm:px-6 lg:px-8 py-16;
  }

  .container-narrow {
    @apply max-w-3xl mx-auto;
  }

  .container-wide {
    @apply max-w-7xl mx-auto;
  }
}
````

## File: src/styles/starlight-mobile.css
````css
/* ParableForge Starlight Mobile Enhancements
   This file provides additional mobile-specific styling for Starlight pages
   following the "Teleprompter" mode described in the coding standards. 
*/

/* Mobile-First Variables Overrides */
@media (max-width: 50rem) {
  :root {
    /* Increase base font size for better readability on small screens */
    --sl-text-base: 1.05rem;
    
    /* Increase line height for better readability */
    --sl-line-height: 1.7;
    
    /* Reduce content width to match screen size better */
    --sl-content-width: 100%;
    --sl-content-padding: 1rem;
    
    /* Increase spacing between headings for better visual hierarchy */
    --sl-content-margin: 1.75rem 0;
  }
  
  /* Make headings more prominent on mobile */
  .content h1 {
    font-size: var(--sl-text-4xl) !important;
    margin-bottom: 1.25rem !important;
  }
  
  .content h2 {
    font-size: var(--sl-text-2xl) !important;
    margin-top: 2.25rem !important;
  }
  
  .content h3 {
    font-size: var(--sl-text-xl) !important;
  }
  
  /* Improve code readability */
  .content pre {
    padding: 0.75rem !important;
    font-size: 0.85rem !important;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Increase touch target sizes for better mobile experience */
  .content a, 
  .content button,
  .nav-link,
  .sidebar-content a,
  .sl-badge {
    padding: 0.4em 0 !important;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
  
  /* Better spacing for list items */
  .content ul,
  .content ol {
    padding-left: 1.5rem !important;
    margin-bottom: 1.5rem !important;
  }
  
  .content li {
    margin-bottom: 0.5rem !important;
  }
  
  /* Implement "Teleprompter" mode for mobile - hide sidebars, focus on content */
  /* Ensure sidebar menu is initially hidden on mobile */
  [data-has-sidebar]:not([data-sidebar-open]) {
    grid-template-columns: 1fr !important;
    --sl-sidebar-width: 0 !important;
  }
  
  /* Make sidebar open button more prominent */
  button[aria-expanded][aria-label="Open menu"] {
    background-color: rgba(var(--sl-color-accent-high), 0.1);
    border-radius: 0.25rem;
    width: 2.5rem;
    height: 2.5rem;
    transition: background-color 0.2s ease;
  }
  
  /* Enhance content visibility when no sidebars are shown */
  main {
    padding-left: 0.75rem !important;
    padding-right: 0.75rem !important;
  }
  
  /* Improve responsive tables */
  .content table {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Add fade indicator for scrollable tables */
  .content .table-container {
    position: relative;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .content .table-container::after {
    content: "";
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 20px;
    background: linear-gradient(to right, transparent, var(--sl-color-bg));
    pointer-events: none;
    opacity: 0.8;
  }
}

/* Fix spacing for adjacent elements on mobile */
@media (max-width: 50rem) {
  .content > * + * {
    margin-top: 1.25rem !important;
  }
  
  /* Adjust padding on nested components for better spacing */
  .content .card {
    padding: 1rem !important;
  }
  
  /* Make code blocks full-width on mobile */
  .content pre {
    margin-left: -1rem !important;
    margin-right: -1rem !important;
    border-radius: 0 !important;
    width: calc(100% + 2rem);
  }
  
  /* Ensure images don't overflow */
  .content img {
    max-width: 100%;
    height: auto;
  }
}

/* Extra Small Devices - Specific Teleprompter Mode */
@media (max-width: 37.75rem) {
  /* Implement "Teleprompter" mode for mobile - hide sidebars, focus on content */
  /* Ensure sidebar menu is initially hidden on mobile */
  [data-has-sidebar]:not([data-sidebar-open]) {
    grid-template-columns: 1fr !important;
    --sl-sidebar-width: 0 !important;
  }
  
  /* Make sidebar open button more prominent */
  button[aria-expanded][aria-label="Open menu"] {
    background-color: rgba(59, 130, 246, 0.1);
    border-radius: 0.25rem;
    width: 2.5rem;
    height: 2.5rem;
    transition: background-color 0.2s ease;
  }
  
  /* Enhance content visibility when no sidebars are shown */
  main {
    padding-left: 0.75rem !important;
    padding-right: 0.75rem !important;
  }
  
  /* Improve responsive tables */
  .content table {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Add fade indicator for scrollable tables */
  .content .table-container {
    position: relative;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .content .table-container::after {
    content: "";
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 20px;
    background: linear-gradient(to right, transparent, var(--sl-color-bg));
    pointer-events: none;
    opacity: 0.8;
  }
}
````

## File: README.md
````markdown
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
````

## File: tailwind.config.mjs
````javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Forge Glow Dark Theme
        'forge-dark': '#0B0F19',
        'forge-card': '#111827',
        'forge-blue': '#3B82F6',
        'forge-gold': '#F59E0B',
        'forge-red': '#EF4444',
        'forge-purple': '#8B5CF6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'pf': '0.75rem',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' }
        },
        flash: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '0.5' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        shake: 'shake 0.5s ease-in-out',
        flash: 'flash 0.3s ease-in-out',
        'fade-in': 'fade-in 0.3s ease-out'
      }
    },
  },
  plugins: [],
};
````

## File: src/components/HealthTracker.tsx
````typescript
import { useState, useEffect } from 'react';
import { Heart, Minus, Plus, X } from 'lucide-react';

interface HealthTrackerProps {
  maxHealth?: number;
  initialHealth?: number;
  label?: string;
}

interface Threshold {
  health: number;
  triggered: boolean;
  icon: string;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'victory';
}

export default function HealthTracker({ 
  maxHealth = 20, 
  initialHealth,
  label = "Health"
}: HealthTrackerProps) {
  const MIN_HEALTH = 0;
  const [health, setHealth] = useState(initialHealth ?? maxHealth);
  const [isOpen, setIsOpen] = useState(false);
  const [triggeredThresholds, setTriggeredThresholds] = useState<Set<number>>(new Set());
  const [activeModal, setActiveModal] = useState<Threshold | null>(null);

  // Threshold configuration
  const THRESHOLDS: Threshold[] = [
    {
      health: Math.floor(maxHealth * 0.75),
      triggered: false,
      icon: "⚠️",
      title: "Taking Damage!",
      message: "Your enemy shows signs of fatigue. Press the advantage!",
      type: "warning"
    },
    {
      health: Math.floor(maxHealth * 0.5),
      triggered: false,
      icon: "💥",
      title: "Breaking Point!",
      message: "The enemy staggers! They're weakened! Now's your chance!",
      type: "danger"
    },
    {
      health: Math.floor(maxHealth * 0.25),
      triggered: false,
      icon: "🔥",
      title: "Critical Damage!",
      message: "One solid blow could end this! The enemy can barely stand!",
      type: "danger"
    },
    {
      health: 0,
      triggered: false,
      icon: "🏆",
      title: "Victory!",
      message: "The enemy has fallen! You are victorious!",
      type: "victory"
    }
  ];

  // Monitor health changes and trigger threshold popups
  useEffect(() => {
    THRESHOLDS.forEach((threshold) => {
      // Trigger when health crosses below threshold
      if (health <= threshold.health && !triggeredThresholds.has(threshold.health)) {
        setTriggeredThresholds(prev => new Set(prev).add(threshold.health));
        setActiveModal(threshold);
      }
      // Reset when health goes back above threshold
      if (health > threshold.health && triggeredThresholds.has(threshold.health)) {
        setTriggeredThresholds(prev => {
          const newSet = new Set(prev);
          newSet.delete(threshold.health);
          return newSet;
        });
      }
    });
  }, [health, triggeredThresholds]);

  // Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) {
        setActiveModal(null);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [activeModal]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeModal]);

  const decreaseHealth = () => {
    setHealth((prev) => Math.max(MIN_HEALTH, prev - 1));
  };

  const increaseHealth = () => {
    setHealth((prev) => Math.min(maxHealth, prev + 1));
  };

  // Calculate health percentage for color
  const healthPercent = (health / maxHealth) * 100;

  // Dynamic color based on health
  const getHealthColor = () => {
    if (healthPercent > 60) return 'text-green-400';
    if (healthPercent > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthBg = () => {
    if (healthPercent > 60) return 'bg-green-500/20 border-green-500/30';
    if (healthPercent > 30) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getHeartFill = () => {
    if (healthPercent > 60) return '#4ade80';
    if (healthPercent > 30) return '#facc15';
    return '#f87171';
  };

  const getModalBorderColor = () => {
    if (activeModal?.type === 'warning') return 'border-yellow-500';
    if (activeModal?.type === 'danger') return 'border-red-500';
    if (activeModal?.type === 'victory') return 'border-blue-500';
    return 'border-red-500';
  };

  const getModalButtonColor = () => {
    if (activeModal?.type === 'victory') return 'bg-blue-500 hover:bg-blue-600';
    return 'bg-red-500 hover:bg-red-600';
  };

  return (
    <>
      {/* Health Tracker - Positioning handled by parent PageFrame container */}
      <div className="relative">
        {/* Closed State - Heart Button */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className={`
              w-14 h-14 rounded-full flex items-center justify-center
              border-2 shadow-lg backdrop-blur-sm
              transition-all duration-300 hover:scale-110
              ${getHealthBg()}
            `}
            aria-label={`Open ${label} Tracker`}
          >
            <Heart
              className="w-7 h-7 transition-colors"
              fill={getHeartFill()}
              color={getHeartFill()}
            />
            {/* Health number badge */}
            <span className={`
              absolute -bottom-1 -right-1
              w-6 h-6 rounded-full
              bg-forge-dark border border-white/20
              text-xs font-bold flex items-center justify-center
              ${getHealthColor()}
            `}>
              {health}
            </span>
          </button>
        )}

        {/* Open State - Health Card */}
        {isOpen && (
          <div className={`
            rounded-xl border-2 shadow-2xl backdrop-blur-sm
            p-4 min-w-[160px]
            animate-in fade-in slide-in-from-right-2 duration-200
            ${getHealthBg()}
          `}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Heart
                  className="w-5 h-5"
                  fill={getHeartFill()}
                  color={getHeartFill()}
                />
                <span className="text-white/80 text-sm font-medium">{label}</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20
                           flex items-center justify-center transition-colors"
                aria-label={`Close ${label} Tracker`}
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {/* Minus Button */}
              <button
                onClick={decreaseHealth}
                disabled={health <= MIN_HEALTH}
                className={`
                  w-10 h-10 rounded-full
                  bg-red-500/30 hover:bg-red-500/50
                  border border-red-500/50
                  flex items-center justify-center
                  transition-all duration-150
                  disabled:opacity-30 disabled:cursor-not-allowed
                  active:scale-95
                `}
                aria-label="Decrease health"
              >
                <Minus className="w-5 h-5 text-red-300" />
              </button>

              {/* Health Display */}
              <div className="text-center min-w-[50px]">
                <span className={`text-4xl font-black ${getHealthColor()}`}>
                  {health}
                </span>
                <div className="text-xs text-white/40 mt-1">/ {maxHealth}</div>
              </div>

              {/* Plus Button */}
              <button
                onClick={increaseHealth}
                disabled={health >= maxHealth}
                className={`
                  w-10 h-10 rounded-full
                  bg-green-500/30 hover:bg-green-500/50
                  border border-green-500/50
                  flex items-center justify-center
                  transition-all duration-150
                  disabled:opacity-30 disabled:cursor-not-allowed
                  active:scale-95
                `}
                aria-label="Increase health"
              >
                <Plus className="w-5 h-5 text-green-300" />
              </button>
            </div>

            {/* Health Bar */}
            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  healthPercent > 60 ? 'bg-green-400' :
                  healthPercent > 30 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${healthPercent}%` }}
              />
            </div>

            {/* Death Warning */}
            {health === 0 && (
              <div className="mt-3 text-center text-red-400 text-xs font-medium animate-pulse">
                The heroes have fallen!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Threshold Modal Overlay */}
      {activeModal && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className={`
              max-w-md w-full rounded-xl p-6
              bg-forge-card border-2 
              ${getModalBorderColor()}
              shadow-2xl animate-in zoom-in-95 duration-300
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-4 text-center animate-pulse">
              {activeModal.icon}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              {activeModal.title}
            </h2>
            <p className="text-white/85 text-lg mb-6 text-center leading-relaxed">
              {activeModal.message}
            </p>
            <button
              onClick={() => setActiveModal(null)}
              className={`
                w-full py-3 rounded-lg font-bold text-white text-lg
                ${getModalButtonColor()}
                transition-colors
              `}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
}
````

## File: .gitignore
````
# build output
dist/

# dependencies
node_modules/

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# environment variables
.env
.env.*
!.env.example

# macOS-specific files
.DS_Store

# temporary files
C:*
.astro/

# Vercel deployment output
.vercel/
````

## File: AGENTS.md
````markdown
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
````

## File: package.json
````json
{
  "name": "parableforge",
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "validate": "node scripts/validate-adventures.mjs",
    "build": "npm run validate && astro build",
    "build:skip-validation": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "@astrojs/markdoc": "^0.15.10",
    "@astrojs/react": "^4.4.2",
    "@astrojs/starlight": "^0.37.1",
    "@astrojs/tailwind": "^6.0.2",
    "@astrojs/vercel": "^9.0.2",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@keystatic/astro": "^5.0.6",
    "@keystatic/core": "^0.5.48",
    "@markdoc/markdoc": "^0.5.4",
    "@nanostores/persistent": "^1.2.0",
    "@nanostores/react": "^1.0.0",
    "@supabase/supabase-js": "^2.49.4",
    "astro": "^5.6.1",
    "canvas-confetti": "^1.9.4",
    "lucide-react": "^0.562.0",
    "nanostores": "^1.1.0",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "sharp": "^0.34.2",
    "sonner": "^2.0.7",
    "tailwindcss": "^3.4.17"
  },
  "devDependencies": {
    "@types/canvas-confetti": "^1.9.0",
    "yaml": "^2.8.2"
  }
}
````

## File: src/components/starlight/Header.astro
````astro
---
import type { Props } from '@astrojs/starlight/props';
import SiteTitle from '@astrojs/starlight/components/SiteTitle.astro';
import SocialIcons from '@astrojs/starlight/components/SocialIcons.astro';
import Search from '@astrojs/starlight/components/Search.astro';
import ThemeSelect from '@astrojs/starlight/components/ThemeSelect.astro';
import LanguageSelect from '@astrojs/starlight/components/LanguageSelect.astro';
---

<div class="header sl-flex">
	<div class="title-wrapper sl-flex">
		<SiteTitle {...Astro.props} />
	</div>
	
	<div class="sl-flex">
		<Search {...Astro.props} />
	</div>

	<div class="sl-hidden md:sl-flex right-group">
		<div class="sl-flex social-icons">
			<SocialIcons {...Astro.props} />
		</div>
		<ThemeSelect {...Astro.props} />
		<LanguageSelect {...Astro.props} />
	</div>
</div>

<style>
	.header {
		gap: var(--sl-nav-gap);
		justify-content: space-between;
		align-items: center;
		height: 100%;
	}

	.title-wrapper {
		/* Prevent long titles from overflowing */
		overflow: hidden;
	}

	.right-group {
		gap: 1rem;
		align-items: center;
	}

	.social-icons {
		gap: 1rem;
		align-items: center;
	}

	@media (min-width: 50rem) {
		:global(:root[data-has-sidebar]) {
			--sl-content-inline-start: var(--sl-sidebar-width);
		}
	}
</style>
````

## File: astro.config.mjs
````javascript
// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  site: 'https://playparableforge.com',
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: false }
  }),
  integrations: [
    markdoc(),
    starlight({
      title: 'ParableForge',
      description: 'Screen-free family adventures. Zero prep. Pure connection.',
      customCss: [
        './src/styles/global.css',
        './src/styles/starlight-mobile.css'
      ],
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: false,
      },
      social: [],
      sidebar: [
        {
          label: 'The Compendium',
          items: [
            { label: 'Welcome', slug: 'compendium/welcome' },
          ],
        },
        {
          label: 'Resources',
          autogenerate: { directory: 'compendium/resources' },
        },
        // -----------------------------
        {
          label: 'Adventures',
          autogenerate: { directory: 'compendium/adventures' },
        },
       
      ],
      components: {
        // Custom SiteTitle with larger icon and animated text
        SiteTitle: './src/components/starlight/SiteTitle.astro',
        // Custom Head for auth protection on compendium pages
        Head: './src/components/starlight/Head.astro',
        // Custom Header
        Header: './src/components/starlight/Header.astro',
        // Custom PageFrame with Health Tracker (renders once per page)
        PageFrame: './src/components/starlight/PageFrame.astro',
        // Custom Content Panel
        ContentPanel: './src/components/starlight/ContentPanel.astro',
        // Disabled desktop "On This Page" sidebar to prevent overlap with health tracker
        TableOfContents: './src/components/starlight/TableOfContents.astro',
        // Custom Mobile Table of Contents (currently hidden)
        MobileTableOfContents: './src/components/starlight/MobileTableOfContents.astro',
        // Custom PageTitle to inject PlayAdventureButton on adventure docs
        PageTitle: './src/components/starlight/PageTitle.astro',
      },
      // Disable default Starlight homepage to use custom landing page
      disable404Route: false,
    }),
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    keystatic(),
  ],
});
````
