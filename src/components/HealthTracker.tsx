import { useState, useEffect } from 'react';
import { Heart, Minus, Plus, X } from 'lucide-react';

interface HealthTrackerProps {
  maxHealth?: number;
  initialHealth?: number;
  label?: string;
}

interface Threshold {
  health: number;
  triggered: boolean;
  icon: string;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'victory';
}

export default function HealthTracker({ 
  maxHealth = 20, 
  initialHealth,
  label = "Health"
}: HealthTrackerProps) {
  const MIN_HEALTH = 0;
  const [health, setHealth] = useState(initialHealth ?? maxHealth);
  const [isOpen, setIsOpen] = useState(false);
  const [triggeredThresholds, setTriggeredThresholds] = useState<Set<number>>(new Set());
  const [activeModal, setActiveModal] = useState<Threshold | null>(null);

  // Threshold configuration
  const THRESHOLDS: Threshold[] = [
    {
      health: Math.floor(maxHealth * 0.75),
      triggered: false,
      icon: "⚠️",
      title: "Taking Damage!",
      message: "Your enemy shows signs of fatigue. Press the advantage!",
      type: "warning"
    },
    {
      health: Math.floor(maxHealth * 0.5),
      triggered: false,
      icon: "💥",
      title: "Breaking Point!",
      message: "The enemy staggers! They're weakened! Now's your chance!",
      type: "danger"
    },
    {
      health: Math.floor(maxHealth * 0.25),
      triggered: false,
      icon: "🔥",
      title: "Critical Damage!",
      message: "One solid blow could end this! The enemy can barely stand!",
      type: "danger"
    },
    {
      health: 0,
      triggered: false,
      icon: "🏆",
      title: "Victory!",
      message: "The enemy has fallen! You are victorious!",
      type: "victory"
    }
  ];

  // Monitor health changes and trigger threshold popups
  useEffect(() => {
    THRESHOLDS.forEach((threshold) => {
      // Trigger when health crosses below threshold
      if (health <= threshold.health && !triggeredThresholds.has(threshold.health)) {
        setTriggeredThresholds(prev => new Set(prev).add(threshold.health));
        setActiveModal(threshold);
      }
      // Reset when health goes back above threshold
      if (health > threshold.health && triggeredThresholds.has(threshold.health)) {
        setTriggeredThresholds(prev => {
          const newSet = new Set(prev);
          newSet.delete(threshold.health);
          return newSet;
        });
      }
    });
  }, [health, triggeredThresholds]);

  // Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) {
        setActiveModal(null);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [activeModal]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeModal]);

  const decreaseHealth = () => {
    setHealth((prev) => Math.max(MIN_HEALTH, prev - 1));
  };

  const increaseHealth = () => {
    setHealth((prev) => Math.min(maxHealth, prev + 1));
  };

  // Calculate health percentage for color
  const healthPercent = (health / maxHealth) * 100;

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

  const getModalBorderColor = () => {
    if (activeModal?.type === 'warning') return 'border-yellow-500';
    if (activeModal?.type === 'danger') return 'border-red-500';
    if (activeModal?.type === 'victory') return 'border-blue-500';
    return 'border-red-500';
  };

  const getModalButtonColor = () => {
    if (activeModal?.type === 'victory') return 'bg-blue-500 hover:bg-blue-600';
    return 'bg-red-500 hover:bg-red-600';
  };

  return (
    <>
      {/* Health Tracker - Positioning handled by parent PageFrame container */}
      <div className="relative">
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
            aria-label={`Open ${label} Tracker`}
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
                <span className="text-white/80 text-sm font-medium">{label}</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20
                           flex items-center justify-center transition-colors"
                aria-label={`Close ${label} Tracker`}
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
                <div className="text-xs text-white/40 mt-1">/ {maxHealth}</div>
              </div>

              {/* Plus Button */}
              <button
                onClick={increaseHealth}
                disabled={health >= maxHealth}
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

      {/* Threshold Modal Overlay */}
      {activeModal && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className={`
              max-w-md w-full rounded-xl p-6
              bg-forge-card border-2 
              ${getModalBorderColor()}
              shadow-2xl animate-in zoom-in-95 duration-300
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-4 text-center animate-pulse">
              {activeModal.icon}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              {activeModal.title}
            </h2>
            <p className="text-white/85 text-lg mb-6 text-center leading-relaxed">
              {activeModal.message}
            </p>
            <button
              onClick={() => setActiveModal(null)}
              className={`
                w-full py-3 rounded-lg font-bold text-white text-lg
                ${getModalButtonColor()}
                transition-colors
              `}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
}
