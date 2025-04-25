# Manually Uploading Your Plugin to GitHub

If you're having trouble pushing directly from the command line, you can manually upload your plugin to GitHub:

## Step 1: Prepare your files

1. Create a ZIP file of your plugin:
   ```bash
   # Make sure you're in the plugin directory
   cd /Users/kvishnukumar/Desktop/ORG\ INVENTORY
   
   # Create a ZIP file (excluding node_modules which can be reinstalled)
   zip -r org-inventory.zip . -x "node_modules/*" ".git/*"
   ```

## Step 2: Upload to GitHub

1. Go to your GitHub repository: https://github.com/heeat/Org-Inventory
2. Click on "Add file" > "Upload files"
3. Drag and drop your zip file or browse to select it
4. Add a commit message, e.g., "Upload Salesforce Org Inventory plugin"
5. Click "Commit changes"

## Step 3: Update repository description (optional)

1. On your repository page, click on the gear icon next to "About" on the right sidebar
2. Add a description, e.g., "Salesforce CLI plugin to list installed packages in an org"
3. Click "Save changes"

## Step 4: Share with friends

Share your repository URL with friends and direct them to the INSTALL.md file for installation instructions. 