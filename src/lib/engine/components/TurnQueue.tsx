/**
 * TURN QUEUE COMPONENT
 * * Manages the Round counter.
 * Updated to use "Round" terminology instead of "Turn" to match tabletop standards.
 */

import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { $currentTurn, advanceTurn, rewindToTurn, $turnHistory } from '../store';
import { ChevronRight, RotateCcw } from 'lucide-react';

interface TurnQueueProps {
  maxTurns?: number;
}

export default function TurnQueue({ maxTurns }: TurnQueueProps) {
  const currentTurn = useStore($currentTurn);
  const history = useStore($turnHistory);
  const [showHistory, setShowHistory] = useState(false);
  
  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* UPDATED LABEL */}
          <div className="text-sm font-bold text-slate-400">ROUND</div>
          <div className="text-3xl font-bold text-white">{currentTurn}</div>
          {maxTurns && <div className="text-slate-500">/ {maxTurns}</div>}
        </div>
        
        <div className="flex gap-2">
          {history.length > 1 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors"
              title="Show round history"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
            </button>
          )}
          
          <button
            onClick={() => advanceTurn()}
            className="px-4 py-2 bg-forge-blue text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 font-semibold"
          >
            {/* UPDATED BUTTON TEXT */}
            Next Round
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {showHistory && (
        <div className="border-t border-slate-700 pt-4 mt-4">
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Round History (Rewind)</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.map(entry => (
              <button
                key={entry.turn}
                onClick={() => {
                  rewindToTurn(entry.turn);
                  setShowHistory(false);
                }}
                className={`w-full text-left p-2 rounded transition-colors ${
                  entry.turn === currentTurn 
                    ? 'bg-forge-blue text-white' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* UPDATED LIST ITEM LABEL */}
                  <span className="font-semibold">Round {entry.turn}</span>
                  <span className="text-xs opacity-70">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}