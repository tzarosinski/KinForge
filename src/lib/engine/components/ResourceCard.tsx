/**
 * RESOURCE CARD COMPONENT
 * 
 * Displays a tracked resource (HP, XP, Trust, etc.) with:
 * - Real-time updates (subscribes to nano store)
 * - Smooth animations on value changes
 * - Theme-based coloring
 * - Multiple display styles (bar, counter, hidden)
 * - Lucide icons for visual clarity
 * 
 * This component is 100% reusable across adventures, courses, habit trackers, etc.
 */

import { useStore } from '@nanostores/react';
import { $engineState } from '../store';
import type { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { Resource } from '../types';

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  const state = useStore($engineState);
  const currentValue = state[resource.id] || resource.initial;
  const percentage = (currentValue / resource.max) * 100;
  
  // Get icon component dynamically from Lucide
  const IconComponent = resource.icon ? 
    (Icons[resource.icon as keyof typeof Icons] as LucideIcon) : 
    null;
  
  // Theme colors for progress bars
  const themeColors = {
    red: 'from-red-500 to-red-700',
    green: 'from-green-500 to-green-700',
    blue: 'from-blue-500 to-blue-700',
    gold: 'from-yellow-500 to-yellow-700',
    purple: 'from-purple-500 to-purple-700'
  };
  
  // Hidden style = tracked but not displayed (used for internal counters)
  if (resource.style === 'hidden') return null;
  
  // Counter style = big number display (good for simple values)
  if (resource.style === 'counter') {
    return (
      <div className="glass-panel p-4 text-center">
        {IconComponent && <IconComponent className="w-8 h-8 mx-auto mb-2 text-forge-gold" />}
        <div className="text-4xl font-bold text-white transition-all duration-300">
          {currentValue}
        </div>
        <div className="text-sm text-slate-400 mt-1">{resource.label}</div>
      </div>
    );
  }
  
  // Bar style = progress bar display (default, best for ranges)
  return (
    <div className="glass-panel p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent className="w-5 h-5 text-forge-gold" />}
          <span className="text-sm font-semibold text-white">{resource.label}</span>
        </div>
        <span className="text-xs text-slate-400">
          {currentValue}/{resource.max}
        </span>
      </div>
      
      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${themeColors[resource.theme]} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
