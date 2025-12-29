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
import { initEngine, startEncounter, resetEngine } from '../store';
import type { Resource } from '../types';

interface GameInitializerProps {
  adventureSlug: string;
  resources: Resource[];
  combatants?: any[];
}

export default function GameInitializer({ 
  adventureSlug, 
  resources, 
  combatants = []
}: GameInitializerProps) {
  useEffect(() => {
    // 1. Initialize resources
    initEngine(adventureSlug, resources);
    
    // 2. Setup Encounter (uses stored party if available)
    // We defer this slightly to ensure the persisted store is hydrated
    setTimeout(() => {
      if (combatants.length > 0) {
        startEncounter(combatants);
      }
    }, 50);
    
    // Cleanup on unmount
    return () => resetEngine();
  }, [adventureSlug]);
  
  return null;
}