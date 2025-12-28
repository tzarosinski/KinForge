/**
 * KEYSTATIC READER UTILITIES
 * 
 * Centralized reading logic for Keystatic content.
 * Provides graceful fallbacks to ensure "the show must go on" even if content is missing.
 * 
 * Why this exists:
 * - Single source of truth for content access
 * - Consistent error handling across routes
 * - Easy to mock for testing
 */

import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';

export const reader = createReader(process.cwd(), keystaticConfig);

/**
 * Get all adventures from Keystatic
 * Returns empty array if reading fails (graceful degradation)
 */
export async function getAllAdventures() {
  try {
    return await reader.collections.adventures.all();
  } catch (error) {
    console.error('Failed to read adventures:', error);
    return [];
  }
}

/**
 * Get a specific adventure by slug
 * Returns null if not found (caller handles fallback)
 */
export async function getAdventure(slug: string) {
  try {
    return await reader.collections.adventures.read(slug);
  } catch (error) {
    console.error(`Failed to read adventure: ${slug}`, error);
    return null;
  }
}

/**
 * FALLBACK ADVENTURE
 * 
 * Used when:
 * - Adventure not found
 * - Adventure has no resources configured
 * - Keystatic read fails
 * 
 * Philosophy: Never crash. Show something playable.
 */
export const FALLBACK_ADVENTURE = {
  title: 'Mystery Adventure',
  description: 'This adventure is still being prepared by the storytellers...',
  duration: '30 minutes',
  difficulty: 'beginner' as const,
  resources: [
    {
      id: 'mystery_points',
      label: 'Mystery Points',
      max: 100,
      initial: 50,
      theme: 'purple' as const,
      style: 'bar' as const,
      icon: 'HelpCircle'
    }
  ],
  rules: [],
  surges: [],
  combatants: [
    {
      id: 'hero',
      name: 'Hero',
      avatar: '🛡️',
      type: 'hero' as const
    }
  ]
};
