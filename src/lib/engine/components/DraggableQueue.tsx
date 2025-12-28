/**
 * DRAGGABLE QUEUE COMPONENT
 * 
 * Manages the turn order for combat encounters with drag-and-drop.
 * 
 * Touch Optimization:
 * - 250ms long-press delay (prevents scroll conflicts)
 * - 5px tolerance (allows tiny hand movements)
 * - Visual feedback during drag (opacity change)
 * 
 * Features:
 * - Reorderable combatant cards
 * - "End Turn" button to advance active combatant
 * - Visual indicator of current turn
 * - Automatic turn advancement when cycling back to first
 * 
 * Integration:
 * - Reads from $combatantQueue store
 * - Updates queue order on drag end
 * - Advances turns via advanceCombatantTurn()
 */

import { 
  DndContext, 
  closestCenter,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { useStore } from '@nanostores/react';
import { $combatantQueue, $currentCombatant, reorderQueue, advanceCombatantTurn } from '../store';
import CombatantCard from './CombatantCard';
import { SkipForward } from 'lucide-react';

export default function DraggableQueue() {
  const combatants = useStore($combatantQueue);
  const currentCombatant = useStore($currentCombatant);
  
  // Touch sensor with 250ms delay (prevents scroll conflicts)
  // Mouse sensor with 8px distance (prevents accidental drags)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Long-press for 250ms
        tolerance: 5 // Allow 5px movement during press
      }
    })
  );
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = combatants.findIndex(c => c.id === active.id);
    const newIndex = combatants.findIndex(c => c.id === over.id);
    
    const newOrder = arrayMove(combatants, oldIndex, newIndex);
    reorderQueue(newOrder);
  };
  
  // Don't render if no combatants
  if (combatants.length === 0) return null;
  
  // Find current combatant for display
  const currentCombatantData = combatants.find(c => c.id === currentCombatant);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide">
          Turn Order
        </h4>
        <button
          onClick={advanceCombatantTurn}
          className="px-3 py-2 min-h-[44px] bg-forge-blue text-white rounded-lg text-xs font-semibold hover:bg-blue-600 active:bg-blue-700 transition-all flex items-center gap-1 touch-manipulation"
        >
          <SkipForward className="w-4 h-4" />
          End Turn
        </button>
      </div>
      
      {/* Current combatant display */}
      {currentCombatantData && (
        <div className="text-center py-2 bg-yellow-900/20 border border-yellow-500/50 rounded">
          <p className="text-xs text-yellow-400 font-semibold">Active:</p>
          <p className="text-white font-bold">
            {currentCombatantData.avatar} {currentCombatantData.name}
          </p>
        </div>
      )}
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={combatants.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {combatants.map(combatant => (
              <CombatantCard
                key={combatant.id}
                id={combatant.id}
                name={combatant.name}
                avatar={combatant.avatar}
                type={combatant.type}
                linkedResource={combatant.linkedResource}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      {/* Mobile Hint */}
      <p className="text-[10px] text-slate-500 text-center md:hidden">
        💡 Long-press a card to reorder · Tap "End Turn" to advance
      </p>
    </div>
  );
}
