# 📝 Adventure Editing Guide (Non-Developers)

A simple guide for editing ParableForge adventures without any coding knowledge.

---

## 🎯 What You'll Be Able to Do

- ✅ Edit adventure content (stories, descriptions, rules)
- ✅ Add new resources (HP, XP, Trust points)
- ✅ Create rules and triggers (what happens when HP hits 0)
- ✅ Manage combat encounters
- ✅ All through a visual editor - **no code!**

---

## 🚀 Getting Started

### Step 1: Access the Editor

1. Open your web browser
2. Go to: **https://playparableforge.com/keystatic**
3. You'll see a login screen

### Step 2: Sign In with GitHub

1. Click the **"Sign in with GitHub"** button
2. If you don't have a GitHub account:
   - Go to: https://github.com/signup
   - Create a free account (takes 2 minutes)
3. Authorize the app when prompted

### Step 3: You're In!

You'll see a dashboard with two sections:
- **Adventures** - The interactive game content
- **Resources** - Tutorial and documentation pages

---

## ✏️ Editing an Adventure

### Finding Adventures

1. Click **"Adventures"** in the left sidebar
2. You'll see a list:
   - **sky-island** - Beginner adventure
   - **siege-of-ironhold** - Advanced adventure
   - **template-adventure** - Starter template

### Opening an Adventure

1. Click on the adventure name
2. The editor will open with all the fields

### Understanding the Editor

The editor has several sections (tabs):

#### 📋 **Metadata** (Basic Info)
- **Title** - Internal name (lowercase-with-hyphens)
- **Description** - Short summary of the adventure
- **Duration** - How long it takes (e.g., "30-45 min")
- **Difficulty** - Beginner, Intermediate, or Advanced

#### 📖 **Adventure Script** (The Story)
This is the main content - what the parent reads aloud.

**Formatting tips:**
- Use `# Heading` for scene titles
- Use `**bold**` for important text
- Use bullet points for lists
- Write clear, simple sentences

#### 🎯 **Resources** (Tracking Numbers)
These are the values that change during play (HP, XP, Trust, etc.)

**Example:** Hero HP
- **ID:** `hero_hp` (unique name, no spaces)
- **Label:** `Hero Hit Points` (what players see)
- **Max:** `100` (highest value)
- **Initial:** `100` (starting value)
- **Theme:** `red` (color scheme)
- **Style:** `bar` (progress bar) or `counter` (big number)
- **Icon:** `Heart` (optional visual)

#### ⚡ **Rules** (What Happens When...)
These make the game interactive.

**Example:** Victory condition
- **Target ID:** `boss_hp` (which resource to watch)
- **Operator:** `<=` (less than or equal to)
- **Threshold:** `0` (the trigger value)
- **Action:** `confetti` (celebrate!)
- **Payload:** `You defeated the boss!` (message to show)

**Common Actions:**
- `toast` - Show a message
- `confetti` - Celebration animation
- `redirect` - Go to another page
- `shake` - Screen shake effect

#### 🌩️ **Surges** (Plot Twists)
Dramatic moments that happen at specific turns.

**Example:** Boss enrages at turn 3
- **Trigger Turn:** `3`
- **Dialogue:** `The boss roars and gains new power!`
- **Force First:** ✅ (move boss to front)
- **Animation:** `shake`
- **Modify Resources:** Add 10 HP to `boss_hp`

#### ⚔️ **Combatants** (Heroes & Enemies)
Characters in the turn queue.

**Example:** Hero
- **ID:** `hero`
- **Name:** `Brave Hero`
- **Avatar:** `🛡️` (emoji)
- **Type:** `hero`
- **Linked Resource:** `hero_hp` (shows HP on card)

---

## 💾 Saving Your Changes

### The Save Button

When you're done editing:

1. Click the **"Commit"** button (top right)
2. A popup appears asking for a description
3. Write a brief note: "Updated boss HP" or "Fixed typo in intro"
4. Click **"Commit"**

### What Happens Next?

**Behind the scenes (automatic):**
1. ✅ Your changes are saved to a "branch"
2. ✅ A "Pull Request" is created
3. ✅ Admin gets notified to review
4. ✅ Once approved, changes go live
5. ✅ You get a notification when published

**You don't need to understand this!** Just know:
- Click "Commit" = Submit for review
- Changes appear after admin approval
- Usually happens within a day

---

## 🎨 Creating a New Adventure

### Step 1: Start from Template

1. Go to **Adventures** → **template-adventure**
2. Read through it to understand the structure
3. Copy the patterns you see

### Step 2: Create New Entry

1. Click **"Create entry"** button
2. Choose a title (e.g., `dragon-mountain`)
3. Fill in all the fields
4. Use template-adventure as reference

### Step 3: Test Your Work

After saving:
1. Visit: `https://playparableforge.com/adventure/your-title`
2. Try playing through it
3. Check that resources update correctly
4. Verify rules trigger as expected

---

## 🆘 Common Questions

### Q: What if I make a mistake?

**A:** Don't worry! Changes aren't live until reviewed. If you notice an error, just make another edit to fix it.

### Q: Can I see my changes before they go live?

**A:** Yes! After committing, click "View Pull Request" to see exactly what changed. The admin can also test before approving.

### Q: What if I'm stuck?

**A:** You can:
- Look at existing adventures for examples
- Ask the admin for help
- Save a draft and come back later

### Q: Can multiple people edit at once?

**A:** Yes! Each person's changes create separate Pull Requests. No conflicts.

### Q: How do I delete something?

**A:** Use the ❌ or trash icon next to resources, rules, etc. Or ask admin to delete an entire adventure.

---

## ✅ Editing Checklist

Before committing changes:

- [ ] Title follows lowercase-with-hyphens format
- [ ] Description is clear and concise
- [ ] Duration is realistic
- [ ] Adventure script is complete and proofread
- [ ] All resources have unique IDs (no spaces)
- [ ] Rules reference valid resource IDs
- [ ] Surge events have turn numbers
- [ ] Commit message describes what you changed

---

## 🎓 Best Practices

### Writing Adventure Scripts

✅ **DO:**
- Write in present tense ("You see a dragon")
- Keep sentences short and clear
- Use descriptive language (sights, sounds, smells)
- Include player prompts ("What do you do?")

❌ **DON'T:**
- Write long paragraphs (hard to read aloud)
- Use complex vocabulary for young kids
- Forget to give players choices
- Railroad the story (let them improvise)

### Naming Resources

✅ **DO:**
- Use descriptive IDs: `dragon_hp`, `trust_points`
- Keep labels short: "Dragon HP" not "Dragon Hit Points Value"
- Choose appropriate colors (red = danger, green = good)

❌ **DON'T:**
- Use spaces in IDs: `dragon hp` ❌
- Use special characters: `dragon's_hp` ❌
- Reuse IDs across resources

### Creating Rules

✅ **DO:**
- Test all rules by playing through
- Use clear, specific messages
- Consider edge cases (what if HP is negative?)
- Chain rules for complex effects

❌ **DON'T:**
- Create contradictory rules
- Forget to test defeat conditions
- Use confusing redirect URLs
- Overuse dramatic effects (confetti/shake)

---

## 📚 Field Reference Quick Guide

### Resource Themes (Colors)
- **Red** - Danger, HP, health
- **Green** - Success, XP, growth
- **Blue** - Energy, mana, magic
- **Gold** - Trust, currency, special
- **Purple** - Mystery, rare, unique

### Resource Styles
- **Bar** - Progress bar (good for HP, XP)
- **Counter** - Big number (good for currency)
- **Hidden** - Tracked but not shown

### Rule Operators
- **<** - Less than
- **>** - Greater than
- **==** - Exactly equal to
- **>=** - Greater than or equal
- **<=** - Less than or equal

### Rule Actions
- **toast** - Show message popup
- **confetti** - Celebration effect
- **shake** - Screen shake
- **redirect** - Go to URL
- **unlock** - Save unlock state

### Surge Animations
- **shake** - Screen shake
- **flash** - Red flash
- **lock** - Screen lock
- **none** - No animation

---

## 🎉 You're Ready!

You now know everything you need to edit ParableForge adventures. Remember:

1. **Be creative** - This is storytelling!
2. **Test your work** - Play through adventures
3. **Ask questions** - Admin is here to help
4. **Have fun** - You're creating magic for families

**Ready to start editing?** Go to: https://playparableforge.com/keystatic

---

*Last updated: December 2025*
