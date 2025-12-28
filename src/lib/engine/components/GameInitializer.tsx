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
