import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  
  collections: {
    adventures: collection({
      label: 'Adventures',
      path: 'content/adventures/*',
      slugField: 'title',
      format: { contentField: 'content' },
      
      schema: {
        // METADATA
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        duration: fields.text({ label: 'Duration (e.g. 30-45 min)' }),
        difficulty: fields.select({
          label: 'Difficulty',
          options: [
            { label: 'Beginner', value: 'beginner' },
            { label: 'Intermediate', value: 'intermediate' },
            { label: 'Advanced', value: 'advanced' }
          ],
          defaultValue: 'beginner'
        }),
        
        // CONTENT (The adventure script)
        content: fields.markdoc({ label: 'Adventure Script' }),
        
        // RESOURCES (HP, XP, Trust, etc.)
        resources: fields.array(
          fields.object({
            id: fields.text({ label: 'Resource ID (e.g. kraken_hp)' }),
            label: fields.text({ label: 'Display Name' }),
            max: fields.integer({ label: 'Max Value', defaultValue: 100 }),
            initial: fields.integer({ label: 'Starting Value', defaultValue: 0 }),
            theme: fields.select({
              label: 'Color Theme',
              options: [
                { label: 'Red (Danger/HP)', value: 'red' },
                { label: 'Green (Success/XP)', value: 'green' },
                { label: 'Blue (Mana/Energy)', value: 'blue' },
                { label: 'Gold (Currency/Trust)', value: 'gold' },
                { label: 'Purple (Magic/Special)', value: 'purple' }
              ],
              defaultValue: 'green'
            }),
            style: fields.select({
              label: 'Display Style',
              options: [
                { label: 'Progress Bar', value: 'bar' },
                { label: 'Large Counter', value: 'counter' },
                { label: 'Hidden (Tracked Only)', value: 'hidden' }
              ],
              defaultValue: 'bar'
            }),
            icon: fields.text({ 
              label: 'Lucide Icon Name (optional)',
              description: 'e.g. Heart, Zap, Shield, Star'
            })
          }),
          {
            label: 'Resources',
            itemLabel: props => props.fields.label.value || 'New Resource'
          }
        ),
        
        // RULES (Triggers & Effects)
        rules: fields.array(
          fields.object({
            targetId: fields.text({ 
              label: 'Target Resource ID',
              description: 'Must match a resource ID exactly'
            }),
            operator: fields.select({
              label: 'Condition',
              options: [
                { label: 'Less Than (<)', value: '<' },
                { label: 'Greater Than (>)', value: '>' },
                { label: 'Equals (==)', value: '==' },
                { label: 'Greater or Equal (>=)', value: '>=' },
                { label: 'Less or Equal (<=)', value: '<=' }
              ],
              defaultValue: '>='
            }),
            threshold: fields.integer({ label: 'Threshold Value' }),
            action: fields.select({
              label: 'Effect Type',
              options: [
                { label: 'Show Toast Message', value: 'toast' },
                { label: 'Fire Confetti', value: 'confetti' },
                { label: 'Shake Screen', value: 'shake' },
                { label: 'Redirect to URL', value: 'redirect' },
                { label: 'Unlock Content', value: 'unlock' },
                { label: 'Advance Turn', value: 'advance_turn' },
                { label: 'Trigger Surge Event', value: 'surge' }
              ],
              defaultValue: 'toast'
            }),
            payload: fields.text({ 
              label: 'Effect Data',
              description: 'Message text, URL, or JSON object',
              multiline: true
            })
          }),
          {
            label: 'Rules & Triggers',
            itemLabel: props => 
              `When ${props.fields.targetId.value} ${props.fields.operator.value} ${props.fields.threshold.value}`
          }
        ),
        
        // SURGE EVENTS (The "Plot Twist" System)
        surges: fields.array(
          fields.object({
            triggerTurn: fields.integer({ 
              label: 'Trigger After Turn #',
              defaultValue: 2
            }),
            dialogue: fields.text({ 
              label: 'Interrupt Dialogue',
              description: 'What the parent reads during the surge',
              multiline: true
            }),
            forceFirst: fields.checkbox({ 
              label: 'Surge Enemy to Front?',
              defaultValue: true
            }),
            animation: fields.select({
              label: 'Visual Effect',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Shake Screen', value: 'shake' },
                { label: 'Red Flash', value: 'flash' },
                { label: 'Screen Lock', value: 'lock' }
              ],
              defaultValue: 'lock'
            }),
            modifyResources: fields.array(
              fields.object({
                resourceId: fields.text({ label: 'Resource to Modify' }),
                delta: fields.integer({ label: 'Change Amount' })
              }),
              { label: 'Resource Changes' }
            )
          }),
          {
            label: 'Surge Events',
            itemLabel: props => `Turn ${props.fields.triggerTurn.value}: Surge`
          }
        ),
        
        // COMBATANTS (Turn-based combat participants)
        combatants: fields.array(
          fields.object({
            id: fields.text({ 
              label: 'ID (unique)',
              description: 'e.g. hero, goblin, dragon'
            }),
            name: fields.text({ label: 'Name' }),
            avatar: fields.text({ 
              label: 'Avatar (emoji)',
              description: 'e.g. 🛡️ for hero, 👹 for goblin'
            }),
            type: fields.select({
              label: 'Type',
              options: [
                { label: 'Hero', value: 'hero' },
                { label: 'Enemy', value: 'enemy' },
                { label: 'Ally', value: 'ally' }
              ],
              defaultValue: 'hero'
            }),
            linkedResource: fields.text({
              label: 'Linked Resource ID (optional)',
              description: 'e.g. "goblin_hp" to show HP on card'
            })
          }),
          {
            label: 'Combatants',
            itemLabel: props => `${props.fields.avatar.value} ${props.fields.name.value || 'New Combatant'}`
          }
        ),
        
        // TURN TIMELINE (Optional pre-scripted events)
        turns: fields.array(
          fields.object({
            turnNumber: fields.integer({ label: 'Turn Number' }),
            eventType: fields.select({
              label: 'Event Type',
              options: [
                { label: 'Show Dialogue', value: 'dialogue' },
                { label: 'Spawn Resource', value: 'spawn_resource' },
                { label: 'Modify Resource', value: 'modify_resource' },
                { label: 'Auto-Advance', value: 'auto_advance' }
              ],
              defaultValue: 'dialogue'
            }),
            payload: fields.text({ 
              label: 'Event Data',
              description: 'JSON object or plain text',
              multiline: true
            })
          }),
          {
            label: 'Turn-Based Events',
            itemLabel: props => `Turn ${props.fields.turnNumber.value}`
          }
        )
      }
    }),
    
    // Keep existing Resources collection for Starlight docs/tutorials
    resources: collection({
      label: 'Resources (Tutorials)',
      path: 'src/content/docs/compendium/resources/*',
      slugField: 'title',
      format: { contentField: 'body' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description' }),
        sidebar: fields.object({
          label: fields.text({ label: 'Sidebar Label' }),
          order: fields.integer({ label: 'Order' })
        }),
        body: fields.markdoc({ label: 'Content' })
      }
    })
  }
});
