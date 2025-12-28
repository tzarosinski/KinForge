/**
 * DRAWER CONTENT COMPONENT
 * 
 * Renders all the interactive controls inside the DirectorDrawer.
 * This component exists because React components can only have React children.
 * 
 * Why this is separate:
 * - DirectorDrawer is a React component (handles drawer open/close state)
 * - Astro JSX children can't be passed to React components properly
 * - Solution: Make ALL drawer content a single React component
 * 
 * Contains:
 * - TurnQueue (turn counter + advance button)
 * - DraggableQueue (combatant cards, if present)
 * - ResourceCards (HP, Trust, etc.)
 * - Quick Action Buttons (Damage/Heal presets)
 */

import React from 'react';
import TurnQueue from './TurnQueue';
import DraggableQueue from './DraggableQueue';
import ResourceCard from './ResourceCard';
import ModifierButton from './ModifierButton';
import type { Resource } from '../types';

interface Combatant {
  id: string;
  name: string;
  avatar: string;
  type: 'hero' | 'enemy' | 'ally';
  linkedResource?: string;
}

interface DrawerContentProps {
  resources: Resource[];
  combatants: Combatant[];
  maxTurns?: number;
}

export default function DrawerContent({ 
  resources, 
  combatants, 
  maxTurns 
}: DrawerContentProps) {
  return (
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
  );
}
