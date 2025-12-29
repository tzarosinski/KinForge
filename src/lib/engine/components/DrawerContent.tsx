/**
 * DRAWER CONTENT COMPONENT
 * * Updated: Removed TurnQueue. Only shows Resources.
 */

import React from 'react';
import ResourceCard from './ResourceCard';
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
      {/* Only Resources remain */}
      {resources.map(resource => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  );
}