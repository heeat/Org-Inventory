// Export the command
export { default as OrgInventoryList } from './commands/org-inventory/list';

// This file is the entry point for your plugin
// It should export all commands and any hooks or utilities

// Define topics
export const topics = [
  {
    name: 'org-inventory',
    description: 'Commands to work with installed packages in a Salesforce org',
  },
]; 