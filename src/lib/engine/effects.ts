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
