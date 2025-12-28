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
