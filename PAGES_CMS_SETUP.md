# Pages CMS Setup and Troubleshooting Guide

This document provides comprehensive information about the Pages CMS implementation in ParableForge, including troubleshooting steps for common issues.

## About Pages CMS

[Pages CMS](https://pagescms.org) is a Git-based content management system that provides a user-friendly interface to edit website content directly through GitHub. In ParableForge, it's used to manage adventure content in the Grimoire.

## Implementation Approach

There are two implementations available:

1. **Standalone HTML Page**: The primary implementation is a standalone HTML file that bypasses Astro processing:
   ```
   public/admin/index.html
   ```

2. **Web App Alternative**: For more reliable access, a web version redirector is available at:
   ```
   public/admin/web-version.html
   ```

This dual approach ensures you always have a way to manage content, even if the local implementation encounters issues.

## Configuration

The CMS configuration is stored in:
```
public/.pages.yml
```

This file defines:
- Content collections to manage (adventures)
- Fields and properties for each content type
- Media handling settings
- GitHub repository settings

## Accessing the Admin Interface

### Local Version
To access the local Pages CMS admin interface:

1. Start your development server: `npm run dev`
2. Navigate to: `http://localhost:[PORT]/admin/index.html` 
   (Note: Check the terminal output for the correct port number)
3. **Important**: Always include `/index.html` in the URL path

### Web Version
If the local version doesn't work:

1. Navigate to: `http://localhost:[PORT]/admin/web-version.html`
2. Click the button to open the Pages CMS Web App
3. Sign in with your GitHub account
4. Connect to your repository if not already connected

## Enhanced Troubleshooting

### Local CMS Not Loading

If you see a blank page or "Failed to initialize" message:

1. **Browser Console Errors**:
   - Press F12 to open developer tools
   - Go to the Console tab
   - Look for specific error messages
   - The debug panel in the bottom-right corner shows initialization status

2. **Configuration Issues**:
   - Check if `.pages.yml` is formatted correctly
   - Ensure content paths match your actual project structure
   - Verify the branch name in settings matches your actual Git branch

3. **GitHub Authentication Problems**:
   - Make sure you're logged into GitHub in the same browser
   - Try using an incognito/private window to rule out cookie issues
   - Check that you have proper permissions to the repository

4. **Script Loading Issues**:
   - The "Try Different Version" button attempts to load an alternative version
   - Check your internet connection
   - Temporarily disable browser extensions that might interfere

### Content Directory Structure

The content structure must match what's specified in `.pages.yml`. Currently configured as:
```
src/content/docs/grimoire/adventures/
```

A test adventure file has been created at:
```
src/content/docs/grimoire/adventures/test-adventure.mdx
```

### Alternative Solutions

If you continue to experience issues with the local integration:

1. **Use the Web Version**:
   - The Pages CMS web app at [https://app.pagescms.org](https://app.pagescms.org) offers the same functionality
   - Changes made through the web app still commit directly to your repository

2. **Try Alternative Browsers**:
   - Some browsers may handle the authentication flow better than others
   - Firefox or Chrome are recommended

3. **Direct File Editing**:
   - As a last resort, you can edit the MDX files directly
   - They're located in `src/content/docs/grimoire/adventures/`

## Best Practices

1. **Never create `admin.astro`**: Avoid creating Astro components that conflict with the static HTML implementation
   
2. **Testing Changes**: After making content changes, restart the development server to see changes reflected

3. **Backup Important Content**: Before extensive editing sessions, consider backing up critical content files

4. **Commit Frequency**: The CMS creates a new commit for each save operation, so save thoughtfully to avoid cluttering history

## Troubleshooting Decision Tree

1. **Can't access admin page at all**:
   - Verify development server is running
   - Check URL is correct (including `/index.html`)
   - Try accessing `/admin/web-version.html` instead

2. **Blank page with Astro buttons at bottom**:
   - Use `/admin/index.html` instead of `/admin`
   - Delete any `src/pages/admin.astro` file if it exists

3. **Debug panel shows "Config File Not found"**:
   - Verify `.pages.yml` exists in public directory
   - Check file permissions

4. **Debug panel shows "Script loaded" but no UI appears**:
   - Likely a GitHub authentication issue
   - Try the "Try Different Version" button
   - Use the web version alternative

## CMS Usage Guide

Once the CMS loads successfully:

1. **Authentication**: Sign in with your GitHub account when prompted
2. **Content Navigation**: Select "Adventures" from the left sidebar
3. **Editing**: Click on an adventure to open the editor
4. **Creating New Content**: Use the "Add new" button in the collection view
5. **Media**: Upload images through the media tab
6. **Publishing**: Changes are automatically committed to the repository

## Support and Documentation

If you need further assistance:
- Pages CMS Documentation: [https://pagescms.org/docs](https://pagescms.org/docs)
- GitHub Repository: [https://github.com/pages-cms/pages-cms](https://github.com/pages-cms/pages-cms)
- Discord Community: [https://pagescms.org/chat](https://pagescms.org/chat)