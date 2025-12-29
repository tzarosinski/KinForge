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
  action: 'toast' | 'confetti' | 'shake' | 'redirect' | 'unlock' | 'advance_turn' | 'surge' | 'flash' | 'remove_combatant';
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
