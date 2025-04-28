# Salesforce Org Inventory Plugin Guide

## Overview

The Org Inventory plugin for Salesforce CLI allows you to quickly list all installed packages in a Salesforce organization. This plugin provides detailed information about each package, including:

- Namespace
- Status (Free/Paid)
- License allocation
- Created date
- Expiration date

## Installation

### Prerequisites

- [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli) installed
- Node.js 14 or later

### Installation Method 1: From npm (Recommended)

Install the plugin directly from npm:

```bash
sf plugins install @heeat/plugin-org-inventory
```

Verify the installation:

```bash
sf plugins
```

You should see `@heeat/plugin-org-inventory` in the list of installed plugins.

### Installation Method 2: From GitHub

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

## Usage

### Listing Installed Packages

The primary command provided by this plugin is:

```bash
sf org-inventory:list --target-org <org>
```

#### Parameters:

- `--target-org <org>` (required): Alias or username for the target Salesforce org
- `--output-file <path>` (optional): Path to output file where the result will be saved
- `--format <format>` (optional): Format of the output file (json, markdown, text), default is json

#### Example:

```bash
sf org-inventory:list --target-org my-dev-org
```

#### Output:

The command will display a formatted table with the following columns:
- Namespace: The package's namespace prefix
- Status: Whether the package is Free or Paid
- Licenses: Available/Total licenses
- Created Date: When the package was installed
- Expiration Date: When the package license expires (or "Never")

## Examples

### Example 1: List packages in the default org

```bash
sf org-inventory:list --target-org default
```

### Example 2: Export package information to JSON

```bash
sf org-inventory:list --target-org my-prod-org --output-file packages.json
```

### Example 3: Export package information to Markdown

```bash
sf org-inventory:list --target-org my-prod-org --output-file packages.md --format markdown
```

### Example 4: Export package information to plain text

```bash
sf org-inventory:list --target-org my-prod-org --output-file packages.txt --format text
```

### Example 5: Use with CI/CD pipelines

```bash
# In a CI/CD script
sf org-inventory:list --target-org $ORG_ALIAS --json | jq '.result' > org-packages.json
```

## Troubleshooting

### Common Issues

1. **Connection Error**
   - Ensure you're properly authenticated to your org
   - Verify the org alias exists with `sf org list`
   - Try logging in again with `sf org login web`

2. **Permission Issues**
   - Ensure your user has the necessary permissions to view package information
   - Try using a system administrator account

3. **Plugin Not Found**
   - Verify the plugin is correctly installed with `sf plugins`
   - Try reinstalling with `sf plugins install @heeat/plugin-org-inventory`

## Development

### Building from Source

```bash
npm run build
```

### Running Tests

```bash
npm test
```

### Cleaning the Project

```bash
npm run clean
```

## Reference

### SOQL Query Used

The plugin uses the following SOQL query to retrieve package information:

```sql
SELECT Id, NamespacePrefix, Status, AllowedLicenses, UsedLicenses, 
       CreatedDate, ExpirationDate
FROM PackageLicense
ORDER BY NamespacePrefix
```

### Package Information Fields

| Field | Description |
|-------|-------------|
| Namespace | The unique namespace prefix of the package |
| Status | Whether the package is Free or Paid |
| Licenses | Number of used licenses out of total available |
| Created Date | Date when the package was installed |
| Expiration Date | Date when the license expires |

## Additional Resources

- [Salesforce CLI Documentation](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Package Installation Documentation](https://help.salesforce.com/articleView?id=distribution_installing_packages.htm) 