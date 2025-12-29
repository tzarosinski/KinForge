# ✅ NEXT STEPS: Complete GitHub Mode Setup

Configuration files have been updated. Complete these manual steps to activate GitHub mode.

---

## 🎯 Current Status

✅ **Completed:**
- Keystatic config updated to GitHub mode
- Documentation created
- Code committed locally

⏳ **Remaining (Your Actions Required):**
- Create GitHub OAuth app
- Configure environment variables
- Deploy and test

---

## 📋 Step-by-Step Checklist

### Phase 1: GitHub OAuth App (5 minutes)

- [ ] **1.1** Go to https://github.com/settings/developers
- [ ] **1.2** Click "OAuth Apps" → "New OAuth App"
- [ ] **1.3** Fill in form:
  - Application name: `ParableForge Keystatic`
  - Homepage URL: `https://playparableforge.com`
  - Callback URL: `https://playparableforge.com/api/keystatic/github/oauth/callback`
- [ ] **1.4** Click "Register application"
- [ ] **1.5** Copy **Client ID** (starts with `Iv1.`)
- [ ] **1.6** Click "Generate new client secret"
- [ ] **1.7** Copy **Client Secret** (save somewhere secure!)

### Phase 2: Generate Secret Key (1 minute)

Run this command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

- [ ] **2.1** Copy the output (should be ~44 characters)

### Phase 3: Local Environment Variables (2 minutes)

- [ ] **3.1** Create or edit `.env` file in project root
- [ ] **3.2** Add these lines (replace with your actual values):

```bash
PUBLIC_KEYSTATIC_GITHUB_CLIENT_ID=Iv1.paste_your_client_id_here
KEYSTATIC_GITHUB_CLIENT_SECRET=paste_your_client_secret_here
KEYSTATIC_SECRET=paste_your_random_secret_here
```

- [ ] **3.3** Save the file
- [ ] **3.4** Verify `.env` is in `.gitignore` (it should be already)

### Phase 4: Vercel Environment Variables (5 minutes)

- [ ] **4.1** Go to https://vercel.com (or use the link below)
- [ ] **4.2** Navigate to your ParableForge project
- [ ] **4.3** Go to Settings → Environment Variables

**Add Variable 1:**
- [ ] **4.4** Key: `PUBLIC_KEYSTATIC_GITHUB_CLIENT_ID`
- [ ] **4.5** Value: Your Client ID from Phase 1
- [ ] **4.6** Environments: ✅ Production, ✅ Preview, ✅ Development
- [ ] **4.7** Click "Save"

**Add Variable 2:**
- [ ] **4.8** Key: `KEYSTATIC_GITHUB_CLIENT_SECRET`
- [ ] **4.9** Value: Your Client Secret from Phase 1
- [ ] **4.10** Environments: ✅ Production, ✅ Preview, ✅ Development
- [ ] **4.11** Sensitive: ✅ Check this box
- [ ] **4.12** Click "Save"

**Add Variable 3:**
- [ ] **4.13** Key: `KEYSTATIC_SECRET`
- [ ] **4.14** Value: Your random secret from Phase 2
- [ ] **4.15** Environments: ✅ Production, ✅ Preview, ✅ Development
- [ ] **4.16** Sensitive: ✅ Check this box
- [ ] **4.17** Click "Save"

### Phase 5: Deploy to Production (3 minutes)

```bash
git push origin main
```

- [ ] **5.1** Run the command above
- [ ] **5.2** Wait for Vercel to deploy (~2-3 minutes)
- [ ] **5.3** Check deployment status at https://vercel.com

### Phase 6: Test Authentication (5 minutes)

- [ ] **6.1** Visit https://playparableforge.com/keystatic
- [ ] **6.2** Click "Sign in with GitHub"
- [ ] **6.3** Authorize the OAuth app when prompted
- [ ] **6.4** Verify you see the Keystatic dashboard
- [ ] **6.5** Confirm you can see:
  - Adventures collection (3 adventures)
  - Resources collection

### Phase 7: Test Editing Flow (10 minutes)

- [ ] **7.1** Click "Adventures"
- [ ] **7.2** Click "sky-island"
- [ ] **7.3** Make a small test change (e.g., add "TEST" to description)
- [ ] **7.4** Click "Commit" button
- [ ] **7.5** Enter commit message: "Test GitHub mode"
- [ ] **7.6** Click "Commit"
- [ ] **7.7** Verify you see: "Changes saved!" confirmation
- [ ] **7.8** Click "View Pull Request" link
- [ ] **7.9** Verify PR was created in GitHub
- [ ] **7.10** Review the PR diff (should show your test change)

### Phase 8: Merge Test PR (3 minutes)

- [ ] **8.1** In GitHub PR page, click "Merge pull request"
- [ ] **8.2** Click "Confirm merge"
- [ ] **8.3** Delete branch (optional): Click "Delete branch"
- [ ] **8.4** Wait for Vercel to auto-deploy (~2 minutes)
- [ ] **8.5** Visit https://playparableforge.com/adventure/sky-island
- [ ] **8.6** Verify your test change appears
- [ ] **8.7** Revert test change if needed (edit and merge another PR)

---

## 🎉 Success!

Once all checkboxes are complete, you have:

✅ **GitHub Mode Active** - Keystatic uses GitHub for storage  
✅ **OAuth Working** - Can sign in via GitHub  
✅ **PR Workflow** - Edits create Pull Requests automatically  
✅ **Auto-Deploy** - Merges trigger Vercel deployments  
✅ **Non-Dev Ready** - Content editors can now edit without Git knowledge  

---

## 📚 Documentation Reference

**For detailed setup instructions:**
- Read: `KEYSTATIC_GITHUB_SETUP.md`

**For editor onboarding:**
- Share: `docs/EDITOR_GUIDE.md`

---

## 🆘 Troubleshooting

### Issue: "OAuth failed"

**Solution:**
- Verify callback URL is exactly: `https://playparableforge.com/api/keystatic/github/oauth/callback`
- Check Client ID matches in `.env` and Vercel
- Try re-creating OAuth app

### Issue: "Environment variable not found"

**Solution:**
- Check Vercel env vars are saved for all environments
- Verify variable names are exact (case-sensitive)
- Redeploy from Vercel dashboard

### Issue: "Cannot access repository"

**Solution:**
- Ensure you have admin access to `tzarosinski/ParableForge`
- Check OAuth app has "repo" scope
- Re-authorize in Keystatic

### Issue: "PR not created"

**Solution:**
- Verify GitHub token has write access
- Check branch protection rules
- Try signing out/in from Keystatic

---

## 🚀 After Setup is Complete

### Onboarding Content Editors

1. Share `docs/EDITOR_GUIDE.md` with them
2. Add them as collaborators on GitHub repo
3. Have them authorize OAuth app
4. Walk through one test edit together

### Optional Enhancements

Consider adding:
- Branch protection rules (require reviews)
- Slack/Discord PR notifications
- Custom commit message templates
- Draft/publish workflow

---

## ⏱️ Estimated Time

- **Phase 1-3:** 10 minutes (OAuth + local setup)
- **Phase 4:** 5 minutes (Vercel env vars)
- **Phase 5-8:** 20 minutes (deploy + testing)

**Total:** ~35 minutes

---

**Ready to start?** Begin with Phase 1!

---

*Generated: December 29, 2025*
