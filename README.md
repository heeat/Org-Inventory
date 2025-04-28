# Salesforce Org Inventory Plugin

This Salesforce CLI plugin provides comprehensive commands to analyze and inventory your Salesforce organization, including installed packages, licenses, and integration points.

[![Version](https://img.shields.io/npm/v/@heeat/plugin-org-inventory.svg)](https://npmjs.org/package/@heeat/plugin-org-inventory)
[![Downloads/week](https://img.shields.io/npm/dw/@heeat/plugin-org-inventory.svg)](https://npmjs.org/package/@heeat/plugin-org-inventory)
[![License](https://img.shields.io/npm/l/@heeat/plugin-org-inventory.svg)](https://github.com/heeat/Org-Inventory/blob/main/package.json)

## Features

- List all installed packages in a Salesforce org
- View organization type and instance information
- Check enabled cloud products
- Monitor user licenses and usage
- Track permission set licenses
- Identify integration points
- Export results in multiple formats (JSON, Markdown, Text)

## Installation

### Prerequisites

- [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli) installed
- [Node.js](https://nodejs.org/) 14 or later
- [Git](https://git-scm.com/downloads) installed

### Install from npm

```bash
sf plugins install @heeat/plugin-org-inventory
```

### Install from source

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

## Usage

### List Installed Packages

```bash
sf org-inventory:list --target-org <your-org>
```

### Get Comprehensive Org Inventory

```bash
sf org-inventory:all --target-org <your-org>
```

### Export Results

Save the list to a JSON file:
```bash
sf org-inventory:list --output-file=packages.json
```

Save in Markdown format:
```bash
sf org-inventory:list --output-file=packages.md --format=markdown
```

Save in text format:
```bash
sf org-inventory:list --output-file=packages.txt --format=text
```

## Development

### Building the Plugin

```bash
# Build the plugin
npm run build

# Run tests
npm test

# Clean temporary files
npm run clean
```

### Local Development

1. Clone the repo
   ```bash
   git clone https://github.com/heeat/Org-Inventory.git
   ```
   
2. Install dependencies
   ```bash
   npm install
   ```
   
3. Link the plugin to your local Salesforce CLI
   ```bash
   sf plugins link .
   ```
   
4. Build the plugin
   ```bash
   npm run build
   ```

## Contributing

We love your input! We want to make contributing to this Salesforce CLI plugin as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

### Development Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Style Guidelines

- Use 2 spaces for indentation
- Use camelCase for variables, methods, and properties
- Use PascalCase for class names and interfaces
- Add JSDoc comments for all methods and classes

## Publishing

To publish updates to npm:

1. Update the version in `package.json`:
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. Build and publish:
   ```bash
   npm run build
   npm publish
   ```

## License

[MIT](LICENSE)

## Issues

Please report any issues at https://github.com/heeat/Org-Inventory/issues 