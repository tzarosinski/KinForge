import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { $engineState, modifyResource } from '../store';
import { Plus, Minus, X, Activity, ChevronUp } from 'lucide-react';
import type { Resource } from '../types';

interface DirectorHUDProps {
  resources: Resource[];
}

export default function DirectorHUD({ resources }: DirectorHUDProps) {
  const state = useStore($engineState);
  const [isOpen, setIsOpen] = useState(false);

  // Filter resources:
  // 1. Must not be style="hidden"
  // 2. "Summoning Pattern": If initial=0 and current=0, hide it (It hasn't appeared yet)
  const visibleResources = resources.filter(r => {
    if (r.style === 'hidden') return false;
    const current = state[r.id] ?? r.initial;
    if (r.initial === 0 && current === 0) return false;
    return true;
  });

  if (visibleResources.length === 0) return null;

  // Find primary resource for the collapsed preview (usually HP)
  const primaryResource = visibleResources.find(r => r.id.includes('hp')) || visibleResources[0];
  const primaryCurrent = state[primaryResource.id] ?? primaryResource.initial;
  const primaryPercent = Math.min(100, Math.max(0, (primaryCurrent / primaryResource.max) * 100));

  const getThemeColor = (percent: number) => {
    if (percent > 60) return 'text-green-400';
    if (percent > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBarColor = (theme: string) => {
    switch (theme) {
      case 'red': return 'from-red-500 to-red-600';
      case 'blue': return 'from-blue-500 to-blue-600';
      case 'green': return 'from-green-500 to-green-600';
      case 'gold': return 'from-yellow-500 to-yellow-600';
      case 'purple': return 'from-purple-500 to-purple-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      
      {/* 1. COLLAPSED STATE (Floating Button) */}
      {!isOpen && (
        <div className="pointer-events-auto mb-6">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-forge-gold/30 p-2 pr-5 rounded-full shadow-2xl hover:scale-105 transition-all"
          >
            {/* Circular Mini-Chart */}
            <div className="relative w-12 h-12 flex items-center justify-center">
               <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#1e293b" strokeWidth="4" />
                <circle 
                  cx="24" cy="24" r="20" 
                  fill="none" 
                  stroke={primaryPercent > 30 ? '#3b82f6' : '#ef4444'} 
                  strokeWidth="4"
                  strokeDasharray="125.6"
                  strokeDashoffset={125.6 - (125.6 * primaryPercent) / 100}
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <Activity className="w-5 h-5 text-slate-300" />
            </div>
            
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Director HUD</div>
              <div className="text-sm font-bold text-white group-hover:text-forge-gold transition-colors">
                Control Resources
              </div>
            </div>
            
            <ChevronUp className="w-5 h-5 text-slate-500 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      )}

      {/* 2. EXPANDED STATE (Mobile-Friendly List) */}
      {isOpen && (
        <div className="pointer-events-auto w-full max-w-lg mx-auto bg-slate-900/95 backdrop-blur-xl border-t border-forge-gold/30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-10 duration-200 rounded-t-2xl overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-black/20">
            <h3 className="text-xs font-bold text-forge-gold uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4" /> Active Resources
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 -mr-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Resource List */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            {visibleResources.map((resource) => {
              const current = state[resource.id] ?? resource.initial;
              const percent = Math.min(100, Math.max(0, (current / resource.max) * 100));

              return (
                <div key={resource.id} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                  {/* Label Row */}
                  <div className="flex justify-between text-xs mb-2 px-1">
                    <span className="font-bold text-slate-300 uppercase">{resource.label}</span>
                    <span className="text-slate-500">{current} / {resource.max}</span>
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center gap-3">
                    {/* Minus Button */}
                    <button
                      onClick={() => modifyResource(resource.id, -1, resource.max)}
                      className="w-12 h-12 flex-shrink-0 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center hover:bg-red-500/20 active:scale-90 transition-all touch-manipulation"
                    >
                      <Minus className="w-6 h-6" />
                    </button>

                    {/* Progress Bar Container */}
                    <div className="flex-1 h-12 bg-slate-900 rounded-lg relative overflow-hidden border border-slate-700 flex items-center justify-center">
                      {/* Background Bar */}
                      <div 
                        className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r ${getBarColor(resource.theme)} opacity-20 transition-all duration-300`} 
                        style={{ width: `${percent}%` }}
                      />
                      {/* Foreground Line (for precision) */}
                      <div 
                        className={`absolute left-0 bottom-0 h-1 bg-gradient-to-r ${getBarColor(resource.theme)} transition-all duration-300`} 
                        style={{ width: `${percent}%` }}
                      />
                      
                      {/* Big Center Value */}
                      <span className="relative z-10 text-2xl font-black text-white tracking-tight">
                        {current}
                      </span>
                    </div>

                    {/* Plus Button */}
                    <button
                      onClick={() => modifyResource(resource.id, 1, resource.max)}
                      className="w-12 h-12 flex-shrink-0 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-center hover:bg-green-500/20 active:scale-90 transition-all touch-manipulation"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}