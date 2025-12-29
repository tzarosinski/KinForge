/**
 * RESOURCE CARD (Compact)
 * * Thinner bars, smaller buttons, less padding.
 */

import { useStore } from '@nanostores/react';
import { $engineState, modifyResource } from '../store';
import type { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Plus, Minus } from 'lucide-react';
import type { Resource } from '../types';

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  const state = useStore($engineState);
  
  // 1. TRUE HIDING LOGIC
  // If it's explicitly hidden OR (starts at 0 and hasn't been touched), don't render.
  const currentValue = state[resource.id] ?? resource.initial;
  if (resource.style === 'hidden') return null;
  if (resource.initial === 0 && currentValue === 0) return null;

  const percentage = Math.min(100, Math.max(0, (currentValue / resource.max) * 100));
  
  const IconComponent = resource.icon ? 
    (Icons[resource.icon as keyof typeof Icons] as LucideIcon) : 
    null;
  
  const getBarColor = (theme: string) => {
    switch (theme) {
      case 'red': return 'from-red-500 to-red-600';
      case 'blue': return 'from-blue-500 to-blue-600';
      case 'gold': return 'from-yellow-500 to-yellow-600';
      case 'purple': return 'from-purple-500 to-purple-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-2 flex items-center gap-3">
      {/* Label Area */}
      <div className="w-16 shrink-0 leading-none">
        <div className="text-[10px] font-bold text-slate-400 uppercase truncate mb-1">
          {resource.label}
        </div>
        <div className="text-xs text-slate-500 font-mono">
          {currentValue}/{resource.max}
        </div>
      </div>

      {/* Controls Area (Button - Bar - Button) */}
      <div className="flex-1 flex items-center gap-2">
        <button
          onClick={() => modifyResource(resource.id, -1, resource.max)}
          className="w-8 h-8 rounded bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center active:scale-95 touch-manipulation"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="flex-1 h-8 bg-slate-900 rounded relative overflow-hidden border border-slate-700/50 flex items-center justify-center">
          <div 
            className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r ${getBarColor(resource.theme)} opacity-20`} 
            style={{ width: `${percentage}%` }}
          />
          <div 
            className={`absolute left-0 bottom-0 h-0.5 bg-gradient-to-r ${getBarColor(resource.theme)} transition-all duration-300`} 
            style={{ width: `${percentage}%` }}
          />
          <span className="relative z-10 text-sm font-bold text-white">
            {currentValue}
          </span>
        </div>

        <button
          onClick={() => modifyResource(resource.id, 1, resource.max)}
          className="w-8 h-8 rounded bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center active:scale-95 touch-manipulation"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}