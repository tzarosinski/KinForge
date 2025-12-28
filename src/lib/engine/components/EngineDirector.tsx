/**
 * ENGINE DIRECTOR COMPONENT
 * 
 * This is an invisible "logic-only" component that watches the engine state
 * and fires rules when conditions are met.
 * 
 * Think of it as the "Dungeon Master" - it knows all the rules and enforces them,
 * but the players (users) don't see it directly.
 * 
 * How it works:
 * 1. Subscribes to $engineState changes
 * 2. On every change, evaluates all rules
 * 3. If a rule condition is met AND hasn't fired yet, trigger the effect
 * 4. Mark the rule as fired to prevent spam
 * 
 * This component must use client:only="react" to avoid hydration issues.
 */

import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $engineState, $currentTurn, markRuleFired, hasRuleFired, advanceTurn } from '../store';
import { $activeSurge } from '../store';
import { fireEffect } from '../effects';
import type { Rule, SurgeEvent } from '../types';

interface EngineDirectorProps {
  rules: Rule[];
  surges: SurgeEvent[];
}

export default function EngineDirector({ rules, surges }: EngineDirectorProps) {
  const state = useStore($engineState);
  const currentTurn = useStore($currentTurn);
  
  // Component lifecycle logging
  useEffect(() => {
    console.log('🎬 EngineDirector mounted', {
      rules: rules.length,
      surges: surges.length
    });
    
    return () => {
      console.log('🎬 EngineDirector unmounting');
    };
  }, []);
  
  // Watch for rule triggers
  useEffect(() => {
    rules.forEach((rule, index) => {
      // Skip if already fired
      if (hasRuleFired(index)) return;
      
      const resourceValue = state[rule.targetId];
      if (resourceValue === undefined) return;
      
      // Evaluate condition
      let conditionMet = false;
      switch(rule.operator) {
        case '<': conditionMet = resourceValue < rule.threshold; break;
        case '>': conditionMet = resourceValue > rule.threshold; break;
        case '==': conditionMet = resourceValue === rule.threshold; break;
        case '>=': conditionMet = resourceValue >= rule.threshold; break;
        case '<=': conditionMet = resourceValue <= rule.threshold; break;
      }
      
      if (conditionMet) {
        console.log(`🎯 Rule triggered: ${rule.targetId} ${rule.operator} ${rule.threshold} → ${rule.action}`);
        markRuleFired(index);
        
        // Special handling for advance_turn and surge
        if (rule.action === 'advance_turn') {
          setTimeout(() => advanceTurn(), 500);
        } else if (rule.action === 'surge') {
          // Trigger surge event by turn number
          const surge = surges.find(s => s.triggerTurn === parseInt(rule.payload));
          if (surge) {
            $activeSurge.set(surge);
          }
        } else {
          fireEffect(rule.action, rule.payload);
        }
      }
    });
  }, [state, rules, surges]);
  
  // Watch for turn-based surge events
  useEffect(() => {
    const surge = surges.find(s => s.triggerTurn === currentTurn);
    if (surge) {
      console.log(`⚡ Surge event triggered at turn ${currentTurn}`);
      $activeSurge.set(surge);
    }
  }, [currentTurn, surges]);
  
  return null; // Invisible component
}
