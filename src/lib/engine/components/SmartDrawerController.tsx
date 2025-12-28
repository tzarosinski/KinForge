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
