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
