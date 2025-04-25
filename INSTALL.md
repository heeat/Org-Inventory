# Installing the Salesforce Org Inventory Plugin

Follow these steps to install the plugin directly from the GitHub repository:

## Prerequisites

- [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli) installed
- [Node.js](https://nodejs.org/) 14 or later
- [Git](https://git-scm.com/downloads) installed

## Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/heeat/Org-Inventory.git
   cd Org-Inventory
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Link the plugin to your Salesforce CLI:
   ```bash
   sf plugins link .
   ```

4. Verify the installation:
   ```bash
   sf plugins
   ```
   You should see `org-inventory` in the list of installed plugins.

## Using the Plugin

Run the following command to list installed packages in your org:

```bash
sf org-inventory:list --target-org <your-org-alias>
```

## Troubleshooting

If you encounter any issues:

1. Make sure you're authenticated to your Salesforce org:
   ```bash
   sf org login web -a <your-org-alias>
   ```

2. If the plugin isn't recognized, try reinstalling:
   ```bash
   sf plugins uninstall org-inventory
   sf plugins link .
   ```

For more detailed information, refer to the [full documentation](docs/guide.md). 