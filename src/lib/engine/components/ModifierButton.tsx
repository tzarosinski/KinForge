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
