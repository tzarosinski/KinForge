/**
 * COMBATANT CARD COMPONENT (Compact Mobile Version)
 * * Tiny on mobile, Large on desktop.
 * * Active card "pops" out visually.
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '@nanostores/react';
import { $engineState, $currentCombatant } from '../store';

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
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging || isActive ? 20 : 1,
  };
  
  // Theme colors
  const typeStyles = {
    hero: 'border-blue-900/50 bg-blue-950/40',
    enemy: 'border-red-900/50 bg-red-950/40',
    ally: 'border-green-900/50 bg-green-950/40'
  };

  // Active State: Gold Border, Scale Up
  const activeStyle = isActive 
    ? 'border-forge-gold bg-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-110 -translate-y-1 z-20 ring-1 ring-forge-gold/50' 
    : `${typeStyles[type]} opacity-60 grayscale-[0.3] scale-90`;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative
        w-14 h-20 md:w-24 md:h-32  /* <--- NEW SMALLER DIMENSIONS */
        rounded-lg md:rounded-xl border
        ${activeStyle}
        transition-all duration-300 ease-out
        flex flex-col items-center justify-center gap-0.5 md:gap-1
        shrink-0 cursor-grab active:cursor-grabbing
        touch-manipulation select-none
      `}
      {...attributes} 
      {...listeners}
    >
      {/* Avatar */}
      <span className={`text-2xl md:text-5xl filter drop-shadow-md transition-transform ${isActive ? 'scale-110' : ''}`}>
        {avatar}
      </span>
      
      {/* Name (Truncated on mobile) */}
      <div className={`text-[9px] md:text-xs font-bold text-center leading-tight px-0.5 w-full truncate ${isActive ? 'text-white' : 'text-slate-500'}`}>
        {name}
      </div>

      {/* HP Badge */}
      {isActive && (
        <div className="absolute -bottom-2 px-1.5 py-0.5 bg-forge-gold text-forge-dark text-[8px] font-black uppercase tracking-wider rounded-full shadow-sm">
          Act
        </div>
      )}
      {!isActive && hp !== null && (
        <div className="absolute -bottom-2 px-1.5 py-0.5 bg-black/60 text-slate-400 text-[8px] font-mono rounded-full border border-slate-700">
          {hp}
        </div>
      )}
    </div>
  );
}