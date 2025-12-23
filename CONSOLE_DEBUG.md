# Debugging Pages CMS with Browser Console

If you're experiencing issues with the Pages CMS admin interface showing a blank page, checking the browser console can help identify the problem.

## How to Access the Browser Console

### Chrome
1. Navigate to your admin page (e.g., http://localhost:4321/admin)
2. Right-click anywhere on the page
3. Select "Inspect" from the context menu
4. Click on the "Console" tab in the developer tools panel

### Firefox
1. Navigate to your admin page
2. Right-click anywhere on the page
3. Select "Inspect Element"
4. Click on the "Console" tab in the developer tools panel

### Edge
1. Navigate to your admin page
2. Right-click anywhere on the page
3. Select "Inspect"
4. Click on the "Console" tab in the developer tools panel

### Safari
1. First, enable the Developer menu by going to Safari > Settings > Advanced and check "Show develop menu in menu bar"
2. Navigate to your admin page
3. Click Develop > Show Web Inspector
4. Click on the "Console" tab

## Common Errors and Solutions

### Script Loading Errors

```
Failed to load resource: net::ERR_FAILED
```

**Solution**: 
- Check your internet connection
- Try using a specific version of the script instead of @latest
- Verify that your Content Security Policy isn't blocking the script

### CORS Errors

```
Access to fetch at 'https://api.github.com/...' from origin 'http://localhost:4321' has been blocked by CORS policy
```

**Solution**:
- Make sure your CSP headers allow connections to GitHub's API
- When testing locally, try using GitHub's web interface for Pages CMS instead

### Authentication Errors

```
GitHub API error: Unauthorized
```

**Solution**:
- Make sure you're logged into GitHub in the same browser
- Check that your GitHub account has access to the repository

### DOM Errors

```
TypeError: Cannot read properties of null (reading 'appendChild')
```

**Solution**:
- Make sure the `<div id="pages-cms"></div>` element exists in your HTML
- Check if there are any JavaScript errors occurring before the Pages CMS script runs

## Testing the Fix

After making changes to fix the issue:

1. Clear your browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. Restart your development server (`npm run dev`)
3. Open the admin page in an incognito/private window
4. Check the console for any remaining errors

If you're still seeing a blank page, copy any error messages from the console and check the [Pages CMS documentation](https://pagescms.org/docs) or [GitHub repository](https://github.com/pages-cms/pages-cms) for more specific solutions.

## Reporting Issues

If you've tried all the solutions and are still having problems, consider:
- Opening an issue on the [Pages CMS GitHub repository](https://github.com/pages-cms/pages-cms/issues)
- Joining their [Discord community](https://pagescms.org/chat) for help