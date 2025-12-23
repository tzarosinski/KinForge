import { useState } from 'react';
import { Heart, Minus, Plus, X } from 'lucide-react';

const MAX_HEALTH = 20;
const MIN_HEALTH = 0;

export default function HealthTracker() {
  const [health, setHealth] = useState(20);
  const [isOpen, setIsOpen] = useState(false);

  const decreaseHealth = () => {
    setHealth((prev) => Math.max(MIN_HEALTH, prev - 1));
  };

  const increaseHealth = () => {
    setHealth((prev) => Math.min(MAX_HEALTH, prev + 1));
  };

  // Calculate health percentage for color
  const healthPercent = (health / MAX_HEALTH) * 100;

  // Dynamic color based on health
  const getHealthColor = () => {
    if (healthPercent > 60) return 'text-green-400';
    if (healthPercent > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthBg = () => {
    if (healthPercent > 60) return 'bg-green-500/20 border-green-500/30';
    if (healthPercent > 30) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getHeartFill = () => {
    if (healthPercent > 60) return '#4ade80';
    if (healthPercent > 30) return '#facc15';
    return '#f87171';
  };

  return (
    <div className="fixed top-24 right-4 z-50">
      {/* Closed State - Heart Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`
            w-14 h-14 rounded-full flex items-center justify-center
            border-2 shadow-lg backdrop-blur-sm
            transition-all duration-300 hover:scale-110
            ${getHealthBg()}
          `}
          aria-label="Open Health Tracker"
        >
          <Heart
            className="w-7 h-7 transition-colors"
            fill={getHeartFill()}
            color={getHeartFill()}
          />
          {/* Health number badge */}
          <span className={`
            absolute -bottom-1 -right-1
            w-6 h-6 rounded-full
            bg-forge-dark border border-white/20
            text-xs font-bold flex items-center justify-center
            ${getHealthColor()}
          `}>
            {health}
          </span>
        </button>
      )}

      {/* Open State - Health Card */}
      {isOpen && (
        <div className={`
          rounded-xl border-2 shadow-2xl backdrop-blur-sm
          p-4 min-w-[160px]
          animate-in fade-in slide-in-from-right-2 duration-200
          ${getHealthBg()}
        `}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart
                className="w-5 h-5"
                fill={getHeartFill()}
                color={getHeartFill()}
              />
              <span className="text-white/80 text-sm font-medium">Health</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20
                         flex items-center justify-center transition-colors"
              aria-label="Close Health Tracker"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {/* Minus Button */}
            <button
              onClick={decreaseHealth}
              disabled={health <= MIN_HEALTH}
              className={`
                w-10 h-10 rounded-full
                bg-red-500/30 hover:bg-red-500/50
                border border-red-500/50
                flex items-center justify-center
                transition-all duration-150
                disabled:opacity-30 disabled:cursor-not-allowed
                active:scale-95
              `}
              aria-label="Decrease health"
            >
              <Minus className="w-5 h-5 text-red-300" />
            </button>

            {/* Health Display */}
            <div className="text-center min-w-[50px]">
              <span className={`text-4xl font-black ${getHealthColor()}`}>
                {health}
              </span>
              <div className="text-xs text-white/40 mt-1">/ {MAX_HEALTH}</div>
            </div>

            {/* Plus Button */}
            <button
              onClick={increaseHealth}
              disabled={health >= MAX_HEALTH}
              className={`
                w-10 h-10 rounded-full
                bg-green-500/30 hover:bg-green-500/50
                border border-green-500/50
                flex items-center justify-center
                transition-all duration-150
                disabled:opacity-30 disabled:cursor-not-allowed
                active:scale-95
              `}
              aria-label="Increase health"
            >
              <Plus className="w-5 h-5 text-green-300" />
            </button>
          </div>

          {/* Health Bar */}
          <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                healthPercent > 60 ? 'bg-green-400' :
                healthPercent > 30 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>

          {/* Death Warning */}
          {health === 0 && (
            <div className="mt-3 text-center text-red-400 text-xs font-medium animate-pulse">
              The heroes have fallen!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
