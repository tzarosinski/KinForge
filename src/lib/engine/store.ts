/**
 * SOVEREIGN ENGINE STORE
 * * This is the "brain" of the engine. It manages all game state using Nano Stores.
 */

import { persistentAtom } from '@nanostores/persistent';
import { atom, computed } from 'nanostores';
import type { EngineState, TurnHistoryEntry, Resource, SurgeEvent } from './types';

// ============================================================================
// PERSISTENT STATE (survives page refresh via localStorage)
// ============================================================================

/**
 * The main state store - a simple key-value dictionary
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
 * Session identifier
 */
export const $sessionId = persistentAtom<string>('pf-session:', '');

/**
 * The Real-Life Party (NEW)
 * Stores the actual kids playing this session.
 */
export const $party = persistentAtom<Array<{ id: string; name: string; avatar: string }>>(
  'pf-party', 
  [],
  {
    encode: JSON.stringify,
    decode: JSON.parse
  }
);

// ============================================================================
// SESSION-ONLY STATE (resets on page load)
// ============================================================================

export const $firedRules = atom<Set<string>>(new Set());
export const $turnHistory = atom<TurnHistoryEntry[]>([]);
export const $activeSurge = atom<SurgeEvent | null>(null);
export const $combatantQueue = atom<Array<{
  id: string;
  name: string;
  avatar: string;
  type: 'hero' | 'enemy' | 'ally';
  linkedResource?: string;
}>>([]);
export const $currentCombatant = atom<string | null>(null);
export const $drawerExpanded = atom<boolean>(false);
export const $shouldAutoExpand = atom<boolean>(false);

// ============================================================================
// COMPUTED VALUES
// ============================================================================

export const $currentTurn = computed($engineState, state => state._currentTurn || 1);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function initEngine(adventureSlug: string, resources: Resource[]) {
  const isAuthenticated = typeof window !== 'undefined' && 
    localStorage.getItem('sb-fhihhvyfluopxcuezqhi-auth-token');
  
  const sessionId = isAuthenticated 
    ? `${adventureSlug}-${Date.now()}` 
    : `guest-${adventureSlug}`;
  
  $sessionId.set(sessionId);
  
  const initialState: EngineState = {
    _currentTurn: 1,
    _sessionStart: Date.now()
  };
  
  resources.forEach(resource => {
    initialState[resource.id] = resource.initial;
  });
  
  $engineState.set(initialState);
  $firedRules.set(new Set());
  $turnHistory.set([{
    turn: 1,
    snapshot: { ...initialState },
    timestamp: Date.now()
  }]);
  $activeSurge.set(null);
}

export function setResource(id: string, value: number) {
  const current = $engineState.get();
  $engineState.set({ ...current, [id]: value });
}

export function modifyResource(id: string, delta: number, max: number) {
  const current = $engineState.get();
  const currentValue = current[id] || 0;
  const newValue = Math.max(0, Math.min(max, currentValue + delta));
  $engineState.set({ ...current, [id]: newValue });
}

export function resetResource(id: string, initialValue: number) {
  setResource(id, initialValue);
}

export function advanceTurn() {
  const current = $engineState.get();
  const nextTurn = (current._currentTurn || 1) + 1;
  const newState = { ...current, _currentTurn: nextTurn };
  
  $engineState.set(newState);
  
  const history = $turnHistory.get();
  $turnHistory.set([...history, {
    turn: nextTurn,
    snapshot: { ...newState },
    timestamp: Date.now()
  }]);
}

export function rewindToTurn(turnNumber: number) {
  const history = $turnHistory.get();
  const targetEntry = history.find(entry => entry.turn === turnNumber);
  
  if (targetEntry) {
    $engineState.set({ ...targetEntry.snapshot });
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

export function markRuleFired(ruleIndex: number) {
  const turn = $currentTurn.get();
  const ruleKey = `${turn}:${ruleIndex}`;
  const fired = $firedRules.get();
  $firedRules.set(new Set([...fired, ruleKey]));
}

export function hasRuleFired(ruleIndex: number): boolean {
  const turn = $currentTurn.get();
  const ruleKey = `${turn}:${ruleIndex}`;
  return $firedRules.get().has(ruleKey);
}

// --- PARTY & COMBAT LOGIC ---

export function setParty(members: Array<{ name: string; avatar: string }>) {
  const partyWithIds = members.map((m, i) => ({
    id: `hero_${i}`,
    name: m.name,
    avatar: m.avatar,
    type: 'hero' as const
  }));
  $party.set(partyWithIds);
}

export function startEncounter(cmsCombatants: Array<any>) {
  const party = $party.get();
  const enemies = cmsCombatants.filter(c => c.type !== 'hero'); 

  // Combine real kids + CMS enemies
  let combat_pool = party.length > 0 ? [...party, ...enemies] : [...cmsCombatants];

  // Fisher-Yates Shuffle
  for (let i = combat_pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combat_pool[i], combat_pool[j]] = [combat_pool[j], combat_pool[i]];
  }

  $combatantQueue.set(combat_pool);

  if (combat_pool.length > 0) {
    $currentCombatant.set(combat_pool[0].id);
  }
}

export function initCombatants(combatants: Array<any>) {
  // Legacy support - routes to startEncounter
  startEncounter(combatants);
}

export function reorderQueue(newOrder: Array<any>) {
  $combatantQueue.set(newOrder);
}

export function moveCombatantToFront(combatantId: string) {
  const queue = $combatantQueue.get();
  const index = queue.findIndex(c => c.id === combatantId);
  if (index > 0) {
    const combatant = queue[index];
    const newQueue = [combatant, ...queue.slice(0, index), ...queue.slice(index + 1)];
    $combatantQueue.set(newQueue);
    $currentCombatant.set(combatantId);
    $shouldAutoExpand.set(true);
  }
}

/**
 * Cycle the turn: Move the current first player to the end of the queue.
 * This ensures the "Active" player is always visual slot #1 (Leftmost).
 */
export function advanceCombatantTurn() {
  const queue = $combatantQueue.get();
  if (queue.length === 0) return;

  // 1. Take the first item (Current Active)
  const [first, ...rest] = queue;
  
  // 2. Move it to the end
  const newQueue = [...rest, first];
  
  // 3. Update the Queue
  $combatantQueue.set(newQueue);
  
  // 4. Update the "Active" pointer to the NEW first person
  if (newQueue.length > 0) {
    $currentCombatant.set(newQueue[0].id);
    
    // Check if we looped a full round (Original Logic preserved just in case)
    // In this new model, a "Round" is harder to track perfectly without a separate counter,
    // but we can increment the round counter every time the original "Hero" hits slot 1 again if needed.
    // For now, we just increment round every X turns where X is party size.
    const currentTurn = $engineState.get()._currentTurn || 1;
    // Simple heuristic: If the new start ID matches the original start ID (complex to track), 
    // OR just increment round count based on clicks?
    // Let's keep it simple: We rely on the Director to see "Round X" or we increment purely on count.
    
    // OPTIONAL: You can make rounds increment purely on action count
    // advanceTurn(); 
  }
}

/**
 * Remove a combatant from the queue by ID
 * Used for "Death" events or "Fleeing" enemies.
 */
export function removeCombatant(combatantId: string) {
  const queue = $combatantQueue.get();
  const currentId = $currentCombatant.get();
  
  const newQueue = queue.filter(c => c.id !== combatantId);
  $combatantQueue.set(newQueue);
  
  if (currentId === combatantId && newQueue.length > 0) {
    advanceCombatantTurn(); 
  }
}

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