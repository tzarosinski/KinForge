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
