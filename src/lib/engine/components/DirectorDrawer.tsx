/**
 * DIRECTOR DRAWER COMPONENT
 * 
 * The mobile-first control panel that transforms based on screen size:
 * 
 * MOBILE: Sticky footer drawer
 * - Collapsed: 24px height (drag handle + mini preview)
 * - Expanded: 70vh height (full controls)
 * - Swipe up/down to toggle
 * - Auto-expands on surge events
 * 
 * DESKTOP: Fixed sidebar
 * - Always visible at 384px width
 * - Scrollable content
 * - Ignores drawer state
 * 
 * Design Philosophy:
 * - Top 70% of mobile screen = Story (reading zone)
 * - Bottom 30% = Controls (thumb zone)
 * - Parent can read comfortably, then swipe up when action needed
 */

import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $drawerExpanded, $shouldAutoExpand, $currentTurn, $currentCombatant, $combatantQueue } from '../store';
import { ChevronUp, ChevronDown } from 'lucide-react';
import TurnQueue from './TurnQueue';
import DraggableQueue from './DraggableQueue';
import ResourceCard from './ResourceCard';
import ModifierButton from './ModifierButton';
import type { Resource } from '../types';

export interface Combatant {
  id: string;
  name: string;
  avatar: string;
  type: 'hero' | 'enemy' | 'ally';
  linkedResource?: string;
}

export interface DirectorDrawerProps {
  resources: Resource[];
  combatants: Combatant[];
  maxTurns?: number;
}

export default function DirectorDrawer({ resources, combatants, maxTurns }: DirectorDrawerProps) {
  const isExpanded = useStore($drawerExpanded);
  const shouldAutoExpand = useStore($shouldAutoExpand);
  const currentTurn = useStore($currentTurn);
  const currentCombatantId = useStore($currentCombatant);
  const combatantQueue = useStore($combatantQueue);
  
  // Component lifecycle logging
  useEffect(() => {
    console.log('📱 DirectorDrawer mounted', {
      resources: resources.length,
      combatants: combatants.length,
      maxTurns,
      expanded: isExpanded
    });
    
    return () => {
      console.log('📱 DirectorDrawer unmounting');
    };
  }, []);
  
  // Auto-expand when triggered by surge events or critical state changes
  useEffect(() => {
    if (shouldAutoExpand && !isExpanded) {
      $drawerExpanded.set(true);
      $shouldAutoExpand.set(false); // Reset trigger
      
      // Scroll to top of drawer content when auto-expanding
      setTimeout(() => {
        const drawer = document.querySelector('[data-drawer-content]');
        if (drawer) {
          drawer.scrollTop = 0;
        }
      }, 100);
    }
  }, [shouldAutoExpand, isExpanded]);
  
  const toggle = () => {
    $drawerExpanded.set(!isExpanded);
  };
  
  return (
    <aside 
      className={`
        fixed bottom-0 left-0 right-0 
        bg-slate-900 border-t border-slate-700 
        shadow-[0_-4px_20px_rgba(0,0,0,0.5)] 
        z-50 
        transition-all duration-300 ease-out
        md:relative md:w-96 md:border-t-0 md:border-l 
        md:h-screen md:overflow-y-auto
        ${isExpanded ? 'h-[70vh]' : 'h-24'}
      `}
    >
      {/* Drag Handle (Mobile Only) */}
      <div 
        onClick={toggle}
        className="md:hidden h-6 flex items-center justify-center cursor-pointer active:bg-slate-800 touch-manipulation"
        role="button"
        aria-label={isExpanded ? 'Collapse controls' : 'Expand controls'}
      >
        <div className="w-12 h-1 bg-slate-600 rounded-full" />
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-slate-500 ml-2" />
        ) : (
          <ChevronUp className="w-4 h-4 text-slate-500 ml-2" />
        )}
      </div>
      
      {/* Header (Always Visible) */}
      <div className="px-4 py-2 flex justify-between items-center border-b border-slate-800">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">
          Director Controls
        </h3>
        
        {/* Mini preview when collapsed (mobile only) */}
        {!isExpanded && (
          <div className="md:hidden flex items-center gap-2 text-xs">
            <span className="text-yellow-400 font-semibold">Turn {currentTurn}</span>
            {currentCombatantId && combatantQueue.length > 0 && (
              <span className="text-white">
                {combatantQueue.find(c => c.id === currentCombatantId)?.avatar || '⚔️'}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Content (Hidden when collapsed on mobile) */}
      <div 
        data-drawer-content
        className={`
          p-4 h-full overflow-y-auto
          ${!isExpanded ? 'hidden md:block' : 'block'}
        `}
      >
        <div className="space-y-4">
          {/* Turn Counter */}
          <TurnQueue maxTurns={maxTurns} />
          
          {/* Draggable Combatant Queue (if combatants present) */}
          {combatants.length > 0 && <DraggableQueue />}
          
          {/* Resource Cards */}
          {resources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
          
          {/* Quick Action Buttons (Mobile-Optimized) */}
          {resources.length > 0 && (
            <div className="border-t border-slate-700 pt-4">
              <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide">
                Quick Actions
              </p>
              <div className="grid grid-cols-2 gap-3">
                {resources.slice(0, 2).map(resource => (
                  <React.Fragment key={`actions-${resource.id}`}>
                    <ModifierButton
                      resourceId={resource.id}
                      delta={-Math.ceil(resource.max * 0.05)}
                      max={resource.max}
                      label="Damage"
                    />
                    <ModifierButton
                      resourceId={resource.id}
                      delta={Math.ceil(resource.max * 0.1)}
                      max={resource.max}
                      label="Heal"
                    />
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Hint text (mobile only, when collapsed) */}
      {!isExpanded && (
        <div className="absolute bottom-2 left-0 right-0 md:hidden">
          <p className="text-center text-xs text-slate-500">
            💡 Swipe up for controls
          </p>
        </div>
      )}
    </aside>
  );
}
