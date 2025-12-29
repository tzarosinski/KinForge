/**
 * DRAGGABLE QUEUE (Position-Based Authority)
 * * The card in the first slot (Leftmost) is ALWAYS the Active Player.
 * * Dragging a card to slot 0 makes it active immediately.
 */

import { useState } from 'react';
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
  horizontalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { useStore } from '@nanostores/react';
import { $combatantQueue, $currentCombatant, reorderQueue, advanceCombatantTurn } from '../store';
import CombatantCard from './CombatantCard';
import { SkipForward } from 'lucide-react';

export default function DraggableQueue() {
  const combatants = useStore($combatantQueue);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    const oldIndex = combatants.findIndex(c => c.id === active.id);
    const newIndex = combatants.findIndex(c => c.id === over.id);
    
    // 1. Calculate the new order
    const newOrder = arrayMove(combatants, oldIndex, newIndex);
    
    // 2. Commit to Store
    reorderQueue(newOrder);
    
    // 3. ENFORCE "Leftmost is Active" Rule
    // Whoever ended up in index 0 gets the focus immediately
    if (newOrder.length > 0) {
      $currentCombatant.set(newOrder[0].id);
    }
  };
  
  const handleNextTurn = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      advanceCombatantTurn();
      setIsAnimating(false);
    }, 300);
  };
  
  if (combatants.length === 0) return null;
  
  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border-b border-white/5 relative flex items-center h-24 md:h-40 overflow-hidden shadow-lg">
      
      {/* Scrollable Track */}
      <div className="flex-1 overflow-hidden py-2 px-3 relative h-full flex items-center">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={combatants.map(c => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div 
              className={`
                flex flex-row gap-2 min-w-max transition-transform ease-in-out items-center
                ${isAnimating ? 'duration-300 -translate-x-[4rem] md:-translate-x-[7rem]' : 'duration-0 translate-x-0'}
              `}
            >
              {combatants.map((combatant) => (
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
      </div>

      {/* Sticky Next Button */}
      <div className="shrink-0 pr-3 pl-1 bg-gradient-to-l from-slate-900 via-slate-900 to-transparent h-full flex items-center z-20">
        <button
          onClick={handleNextTurn}
          disabled={isAnimating}
          className="group flex flex-col items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-forge-blue/10 border border-forge-blue/30 hover:bg-forge-blue hover:text-white transition-all active:scale-95 touch-manipulation"
        >
          <SkipForward className="w-5 h-5 md:w-6 md:h-6 text-forge-blue group-hover:text-white" />
        </button>
      </div>
    </div>
  );
}