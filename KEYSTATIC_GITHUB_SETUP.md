# 🔐 Keystatic GitHub Mode Setup Guide

This guide walks you through setting up Keystatic with GitHub storage mode, allowing non-developers to edit content via Pull Requests without knowing Git.

---

## 📋 Prerequisites

- GitHub account with admin access to `tzarosinski/ParableForge`
- Vercel account with access to ParableForge project
- Local development environment set up

---

## 🎯 What This Achieves

**Before:** Editors need to know Git commands (commit, push)  
**After:** Editors click "Save" in web UI → automatic Pull Request created

---

## Step 1: Create GitHub OAuth App

### 1.1 Navigate to GitHub Developer Settings

Go to: https://github.com/settings/developers

Click: **"OAuth Apps"** → **"New OAuth App"**

### 1.2 Configure OAuth App

Fill in the form:

| Field | Value |
|-------|-------|
| **Application name** | `ParableForge Keystatic` |
| **Homepage URL** | `https://playparableforge.com` |
| **Application description** | `Content management for ParableForge adventures` |
| **Authorization callback URL** | `https://playparableforge.com/api/keystatic/github/oauth/callback` |

Click **"Register application"**

### 1.3 Get Credentials

After registration, you'll see:

- **Client ID** - Copy this (starts with `Iv1.`)
- **Client Secret** - Click "Generate a new client secret" → Copy it

⚠️ **IMPORTANT:** Save these somewhere secure! You'll need them in the next steps.

---

## Step 2: Generate Keystatic Secret

You need a random secret string for encrypting sessions.

### Option A: Using Node.js (Recommended)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output (should be ~44 characters)

### Option B: Using OpenSSL

```bash
openssl rand -base64 32
```

### Option C: Online Generator

Visit: https://generate-secret.vercel.app/32

---

## Step 3: Add Environment Variables Locally

### 3.1 Create .env File

In your project root, create `.env` (or update if it exists):

```bash
# Copy from .env.example
cp .env.example .env
```

### 3.2 Add Keystatic Variables

Edit `.env` and add:

```bash
# Keystatic GitHub Mode
PUBLIC_KEYSTATIC_GITHUB_CLIENT_ID=Iv1.your_actual_client_id
KEYSTATIC_GITHUB_CLIENT_SECRET=your_actual_client_secret
KEYSTATIC_SECRET=your_generated_random_secret
```

Replace with your actual values from Steps 1 and 2.

### 3.3 Verify .env is Ignored

Check `.gitignore` includes:

```
.env
.env.*
!.env.example
```

✅ This prevents secrets from being committed to Git.

---

## Step 4: Add Environment Variables to Vercel

### 4.1 Navigate to Vercel Project

Go to: https://vercel.com/your-account/parableforge/settings/environment-variables

### 4.2 Add Each Variable

Add these **3 environment variables**:

#### Variable 1:
- **Key:** `PUBLIC_KEYSTATIC_GITHUB_CLIENT_ID`
- **Value:** `Iv1.your_actual_client_id` (from Step 1)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Click **"Save"**

#### Variable 2:
- **Key:** `KEYSTATIC_GITHUB_CLIENT_SECRET`
- **Value:** Your client secret (from Step 1)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- **Sensitive:** ✅ Check this box (hides value)
- Click **"Save"**

#### Variable 3:
- **Key:** `KEYSTATIC_SECRET`
- **Value:** Your random secret (from Step 2)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- **Sensitive:** ✅ Check this box (hides value)
- Click **"Save"**

---

## Step 5: Test Locally

### 5.1 Start Dev Server

```bash
npm run dev
```

### 5.2 Access Keystatic

Open: http://localhost:4321/keystatic

### 5.3 Expected Behavior

You should see:

```
Sign in to Keystatic
To edit content, sign in with GitHub
[Sign in with GitHub button]
```

⚠️ **Note:** In local dev, GitHub OAuth won't work fully (callback URL mismatch). This is expected. Production will work correctly.

---

## Step 6: Deploy to Production

### 6.1 Commit Changes

```bash
git add keystatic.config.ts .env.example KEYSTATIC_GITHUB_SETUP.md
git commit -m "feat: switch Keystatic to GitHub storage mode

- Update storage from 'local' to 'github'
- Add OAuth environment variables
- Add setup documentation for GitHub mode
- Enables non-developers to edit via Pull Requests"
git push origin main
```

### 6.2 Wait for Vercel Deployment

Monitor: https://vercel.com/your-account/parableforge/deployments

Wait for: ✅ "Deployment completed"

---

## Step 7: Test Production

### 7.1 Access Production Keystatic

Visit: https://playparableforge.com/keystatic

### 7.2 Sign In

Click: **"Sign in with GitHub"**

You'll be redirected to GitHub OAuth authorization screen.

Click: **"Authorize ParableForge Keystatic"**

### 7.3 Verify Access

After authorization, you should see:

```
Keystatic
Collections:
- Adventures (3)
- Resources (1)
```

---

## Step 8: Test Content Editing Flow

### 8.1 Edit an Adventure

1. Click **"Adventures"**
2. Click **"sky-island"**
3. Make a small change (e.g., update description)
4. Click **"Commit"** button

### 8.2 Expected Pull Request Behavior

Keystatic will:
1. Create a new branch: `keystatic/sky-island-TIMESTAMP`
2. Commit your changes to that branch
3. Create a Pull Request automatically
4. Show confirmation: "Changes saved! View Pull Request →"

### 8.3 Review Pull Request

1. Go to: https://github.com/tzarosinski/ParableForge/pulls
2. You should see: **"Update sky-island.mdoc"** (or similar)
3. Click on the PR to review changes
4. See your edits in the diff view

### 8.4 Merge Pull Request

1. Review the changes
2. Click **"Merge pull request"**
3. Click **"Confirm merge"**
4. Delete branch (optional): Click **"Delete branch"**

### 8.5 Verify Deployment

1. Vercel auto-deploys on merge
2. Wait ~2-3 minutes
3. Visit: https://playparableforge.com/adventure/sky-island
4. Verify your changes appear

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] OAuth app created in GitHub
- [ ] Local `.env` has 3 Keystatic variables
- [ ] Vercel has 3 Keystatic environment variables
- [ ] Code deployed to production
- [ ] Can sign in at `/keystatic` on production
- [ ] Can edit content in Keystatic UI
- [ ] Edits create Pull Requests automatically
- [ ] Merging PR triggers Vercel deployment
- [ ] Changes appear on live site

---

## 🎓 Onboarding Non-Developer Editors

Once setup is complete, share this simple guide with editors:

### For Content Editors (Non-Developers)

**Step 1: Access Keystatic**
- Visit: https://playparableforge.com/keystatic
- Click "Sign in with GitHub"
- Authorize the app (one-time)

**Step 2: Edit Content**
- Click "Adventures"
- Click the adventure you want to edit
- Make your changes in the visual editor
- Click "Commit" when done

**Step 3: Wait for Approval**
- Your changes create a "Pull Request"
- Admin will review and approve
- Once approved, changes go live automatically
- You'll get a GitHub notification when live

**That's it!** No Git commands, no terminal, no technical knowledge needed.

---

## 🔧 Troubleshooting

### Issue: "OAuth authorization failed"

**Cause:** Callback URL mismatch

**Fix:**
1. Go to: https://github.com/settings/developers
2. Click your OAuth app
3. Verify callback URL is exactly: `https://playparableforge.com/api/keystatic/github/oauth/callback`
4. Save changes

### Issue: "Environment variable not found"

**Cause:** Missing or misconfigured env vars

**Fix:**
1. Check Vercel: https://vercel.com/your-account/parableforge/settings/environment-variables
2. Verify all 3 variables exist
3. Ensure they're enabled for Production environment
4. Redeploy if needed

### Issue: "Cannot access repository"

**Cause:** OAuth app doesn't have repo permissions

**Fix:**
1. When authorizing, ensure "repo" scope is granted
2. Revoke authorization: https://github.com/settings/applications
3. Re-authorize via Keystatic

### Issue: "Pull Request not created"

**Cause:** Editor doesn't have write access to repo

**Fix:**
1. Add editor as collaborator: https://github.com/tzarosinski/ParableForge/settings/access
2. Give "Write" permission
3. They must accept invitation

---

## 🚀 Next Steps

### Optional Enhancements

1. **Custom Commit Messages**
   - Editors can write descriptive commit messages
   - Better PR descriptions

2. **Branch Protection**
   - Require approvals before merge
   - Prevent direct pushes to main

3. **Slack/Discord Notifications**
   - Get notified of new PRs
   - Quick review workflow

4. **Draft Mode**
   - Save drafts without creating PRs
   - Requires additional configuration

---

## 📚 Resources

- **Keystatic Docs:** https://keystatic.com/docs/github-mode
- **GitHub OAuth:** https://docs.github.com/en/developers/apps/building-oauth-apps
- **Vercel Env Vars:** https://vercel.com/docs/concepts/projects/environment-variables

---

## 🆘 Need Help?

If you encounter issues during setup:

1. Check troubleshooting section above
2. Review Keystatic logs in browser console
3. Check Vercel deployment logs
4. Verify all environment variables are correct

---

**Ready to proceed?** Start with Step 1 and work through each section carefully!
