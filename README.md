# Salesforce Org Inventory Plugin

This Salesforce CLI plugin provides commands to list all installed packages in a Salesforce organization.

[![Version](https://img.shields.io/npm/v/org-inventory.svg)](https://npmjs.org/package/org-inventory)
[![License](https://img.shields.io/npm/l/org-inventory.svg)](https://github.com/username/org-inventory/blob/main/package.json)

## Quick Start

```bash
# Link the plugin to your Salesforce CLI
sf plugins link .

# List installed packages in an org
sf org-inventory:list --target-org <your-org>
```

## Documentation

For complete installation and usage instructions, see the [comprehensive guide](docs/guide.md).

## Commands

### org-inventory:list

List all installed packages in a Salesforce org

```
USAGE
  $ sf org-inventory:list --target-org <value>

FLAGS
  --target-org=<value>  (required) Username or alias of the target org

DESCRIPTION
  List all installed packages in a Salesforce org

  Lists namespace, status, licensing information, and dates for all packages installed in the specified org.

EXAMPLES
  $ sf org-inventory:list --target-org myorg
```

## Development

```bash
# Build the plugin
npm run build

# Run tests
npm test

# Clean temporary files
npm run clean
```

## Issues

Please report any issues at https://github.com/username/org-inventory/issues

## Development

```bash
# Clone the repository
git clone https://github.com/username/org-inventory.git
cd org-inventory

# Install dependencies
npm install

# Build
npm run build

# Link the plugin to use locally
sf plugins link .
```

## Usage Examples

List all installed packages in your org:

```bash
sf org-inventory:list
```

Save the list to a JSON file:

```bash
sf org-inventory:list --output-file=packages.json
```

Save the list in Markdown format:

```bash
sf org-inventory:list --output-file=packages.md --format=markdown
```

Save the list in text format:

```bash
sf org-inventory:list --output-file=packages.txt --format=text
``` 