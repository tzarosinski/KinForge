#!/usr/bin/env node

/**
 * ADVENTURE CONTENT VALIDATOR
 * 
 * Validates all adventure files before build to catch errors early.
 * 
 * Checks:
 * - Valid YAML frontmatter
 * - Required fields present
 * - Resources array not empty
 * - No duplicate resource IDs
 * - Rules reference valid resource IDs
 * - Surge events have valid turn numbers
 * - Content body exists
 * 
 * Usage:
 *   node scripts/validate-adventures.mjs
 * 
 * Exit codes:
 *   0 = All adventures valid
 *   1 = Validation errors found
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import yaml from 'yaml';

const ADVENTURES_DIR = 'content/adventures';
const REQUIRED_FIELDS = ['title', 'description', 'resources'];

let totalAdventures = 0;
let errors = [];

console.log('🔍 Validating adventure content...\n');

try {
  // Read all .mdoc files
  const files = await readdir(ADVENTURES_DIR);
  const adventureFiles = files.filter(f => f.endsWith('.mdoc'));
  
  totalAdventures = adventureFiles.length;
  console.log(`Found ${totalAdventures} adventure(s) to validate\n`);
  
  for (const filename of adventureFiles) {
    const filepath = join(ADVENTURES_DIR, filename);
    const content = await readFile(filepath, 'utf-8');
    
    console.log(`📄 Checking: ${filename}`);
    
    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    
    if (!frontmatterMatch) {
      errors.push({
        file: filename,
        error: 'No frontmatter found (missing --- delimiters)'
      });
      console.log(`  ❌ No frontmatter found\n`);
      continue;
    }
    
    let data;
    try {
      data = yaml.parse(frontmatterMatch[1]);
    } catch (yamlError) {
      errors.push({
        file: filename,
        error: `Invalid YAML: ${yamlError.message}`
      });
      console.log(`  ❌ Invalid YAML: ${yamlError.message}\n`);
      continue;
    }
    
    // Check required fields
    const missingFields = REQUIRED_FIELDS.filter(field => !data[field]);
    if (missingFields.length > 0) {
      errors.push({
        file: filename,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
      console.log(`  ❌ Missing fields: ${missingFields.join(', ')}`);
    }
    
    // Check resources array
    if (!data.resources || !Array.isArray(data.resources)) {
      errors.push({
        file: filename,
        error: 'Resources must be an array'
      });
      console.log(`  ❌ Resources must be an array`);
    } else if (data.resources.length === 0) {
      errors.push({
        file: filename,
        error: 'At least one resource is required'
      });
      console.log(`  ❌ No resources defined`);
    } else {
      // Check for duplicate resource IDs
      const resourceIds = data.resources.map(r => r.id);
      const duplicates = resourceIds.filter((id, index) => resourceIds.indexOf(id) !== index);
      if (duplicates.length > 0) {
        errors.push({
          file: filename,
          error: `Duplicate resource IDs: ${duplicates.join(', ')}`
        });
        console.log(`  ❌ Duplicate resource IDs: ${duplicates.join(', ')}`);
      }
      
      // Validate each resource
      data.resources.forEach((resource, index) => {
        if (!resource.id) {
          errors.push({
            file: filename,
            error: `Resource at index ${index} missing id`
          });
          console.log(`  ❌ Resource ${index} missing id`);
        }
        if (!resource.label) {
          errors.push({
            file: filename,
            error: `Resource "${resource.id}" missing label`
          });
          console.log(`  ❌ Resource "${resource.id}" missing label`);
        }
        if (resource.max == null) {
          errors.push({
            file: filename,
            error: `Resource "${resource.id}" missing max value`
          });
          console.log(`  ❌ Resource "${resource.id}" missing max`);
        }
        if (resource.initial == null) {
          errors.push({
            file: filename,
            error: `Resource "${resource.id}" missing initial value`
          });
          console.log(`  ❌ Resource "${resource.id}" missing initial`);
        }
      });
      
      // Check rules reference valid resources
      if (data.rules && Array.isArray(data.rules)) {
        data.rules.forEach((rule, index) => {
          if (!resourceIds.includes(rule.targetId)) {
            errors.push({
              file: filename,
              error: `Rule ${index} references non-existent resource "${rule.targetId}"`
            });
            console.log(`  ❌ Rule ${index} references invalid resource "${rule.targetId}"`);
          }
        });
      }
      
      // Validate surge events
      if (data.surges && Array.isArray(data.surges)) {
        data.surges.forEach((surge, index) => {
          if (surge.triggerTurn == null || surge.triggerTurn < 1) {
            errors.push({
              file: filename,
              error: `Surge ${index} has invalid triggerTurn (must be >= 1)`
            });
            console.log(`  ❌ Surge ${index} has invalid triggerTurn`);
          }
          if (!surge.dialogue) {
            errors.push({
              file: filename,
              error: `Surge ${index} missing dialogue`
            });
            console.log(`  ❌ Surge ${index} missing dialogue`);
          }
          
          // Check surge resource modifications
          if (surge.modifyResources && Array.isArray(surge.modifyResources)) {
            surge.modifyResources.forEach((mod) => {
              if (!resourceIds.includes(mod.resourceId)) {
                errors.push({
                  file: filename,
                  error: `Surge ${index} modifies non-existent resource "${mod.resourceId}"`
                });
                console.log(`  ❌ Surge ${index} modifies invalid resource "${mod.resourceId}"`);
              }
            });
          }
        });
      }
    }
    
    // Check content body exists
    const contentBody = content.substring(frontmatterMatch[0].length).trim();
    if (!contentBody || contentBody.length === 0) {
      errors.push({
        file: filename,
        error: 'Content body is empty'
      });
      console.log(`  ❌ No content body`);
    }
    
    // Success message if no errors for this file
    const fileErrors = errors.filter(e => e.file === filename);
    if (fileErrors.length === 0) {
      console.log(`  ✅ Valid\n`);
    } else {
      console.log('');
    }
  }
  
  // Summary
  console.log('─'.repeat(50));
  if (errors.length === 0) {
    console.log(`\n✅ All ${totalAdventures} adventure(s) validated successfully!\n`);
    process.exit(0);
  } else {
    console.log(`\n❌ Found ${errors.length} error(s) in ${totalAdventures} adventure(s)\n`);
    console.log('Errors by file:');
    const errorsByFile = {};
    errors.forEach(e => {
      if (!errorsByFile[e.file]) errorsByFile[e.file] = [];
      errorsByFile[e.file].push(e.error);
    });
    Object.entries(errorsByFile).forEach(([file, errs]) => {
      console.log(`\n${file}:`);
      errs.forEach(err => console.log(`  - ${err}`));
    });
    console.log('');
    process.exit(1);
  }
} catch (error) {
  console.error('\n❌ Validation script error:', error.message);
  process.exit(1);
}
