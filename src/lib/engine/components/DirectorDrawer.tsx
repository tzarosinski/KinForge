/**
 * DIRECTOR DRAWER (Ultra-Compact)
 * * Mobile: No header, just drag handle + cards. Collapsed height = 32px.
 * * Desktop: Full header + sidebar.
 */

import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $drawerExpanded, $shouldAutoExpand, $currentTurn } from '../store';
import { ChevronUp, ChevronDown } from 'lucide-react';
import ResourceCard from './ResourceCard';
import type { Resource } from '../types';

export interface DirectorDrawerProps {
  resources: Resource[];
  combatants: any[];
  maxTurns?: number;
}

export default function DirectorDrawer({ resources }: DirectorDrawerProps) {
  const isExpanded = useStore($drawerExpanded);
  const shouldAutoExpand = useStore($shouldAutoExpand);
  const currentTurn = useStore($currentTurn);
  
  // Auto-expand on Surges
  useEffect(() => {
    if (shouldAutoExpand && !isExpanded) {
      $drawerExpanded.set(true);
      $shouldAutoExpand.set(false);
    }
  }, [shouldAutoExpand, isExpanded]);
  
  const toggle = () => {
    $drawerExpanded.set(!isExpanded);
  };
  
  return (
    <aside 
      className={`
        fixed bottom-0 left-0 right-0 
        bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 
        shadow-[0_-4px_20px_rgba(0,0,0,0.5)] 
        z-40 
        transition-all duration-300 ease-out
        md:relative md:w-80 md:border-t-0 md:border-l 
        md:h-screen md:overflow-y-auto
        ${isExpanded ? 'h-[40vh]' : 'h-8'} /* <--- 32px Collapsed Height (Tiny!) */
      `}
    >
      {/* Drag Handle (Mobile Only) */}
      <div 
        onClick={toggle}
        className="md:hidden h-8 flex items-center justify-center cursor-pointer active:bg-slate-800 touch-manipulation hover:bg-slate-800/50 transition-colors"
      >
        <div className="w-12 h-1 bg-slate-600 rounded-full" />
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-slate-500 ml-2" />
        ) : (
          <ChevronUp className="w-4 h-4 text-slate-500 ml-2" />
        )}
      </div>
      
      {/* Header (DESKTOP ONLY - Hidden on Mobile) */}
      <div className="hidden md:flex px-4 pb-2 justify-between items-center border-b border-slate-800/50 pt-4">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">
          Resources
        </h3>
        <span className="text-yellow-500 font-mono text-[10px] font-bold">Round {currentTurn}</span>
      </div>
      
      {/* Content */}
      <div 
        data-drawer-content
        className={`
          px-3 pb-6 pt-1 h-full overflow-y-auto
          ${!isExpanded ? 'hidden md:block' : 'block'}
        `}
      >
        <div className="space-y-2 pb-12">
          {resources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
          
          {resources.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-2">
              No active resources.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}