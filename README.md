# Salesforce Org Inventory Plugin

A comprehensive Salesforce CLI plugin for inventorying your Salesforce org's configuration, including cloud products, packages, licenses, and integrations.

## Features

- **Cloud Products Detection**: Identifies enabled cloud products through multiple detection methods
- **Package Management**: Lists all installed packages and their status
- **License Management**: Tracks user licenses and permission set licenses
- **Integration Points**: Maps out all integration points including named credentials and custom settings
- **Configurable Detection**: Customizable detection rules through configuration files
- **Multiple Output Formats**: Supports JSON, Markdown, and text output formats
- **Production Ready**: Includes error handling, logging, retry mechanisms, and performance optimizations

## Installation

```bash
sf plugins:install org-inventory
```

## Usage

### Basic Commands

```bash
# Get comprehensive inventory
sf org-inventory:all --target-org myorg

# List cloud products
sf org-inventory:cloud-products --target-org myorg

# List installed packages
sf org-inventory:packages --target-org myorg

# List user licenses
sf org-inventory:user-licenses --target-org myorg

# List permission set licenses
sf org-inventory:permission-set-licenses --target-org myorg

# List integration points
sf org-inventory:integrations --target-org myorg
```

### Output Options

```bash
# Save to JSON file
sf org-inventory:all --target-org myorg --output-file=inventory.json

# Save in Markdown format
sf org-inventory:all --target-org myorg --output-file=inventory.md --format=markdown

# Save in text format
sf org-inventory:all --target-org myorg --output-file=inventory.txt --format=text
```

## Configuration

The plugin uses a configuration file located at `src/config/default.json`. You can customize:

- Cloud product detection rules
- Integration point types
- Performance settings
- Logging configuration
- Security settings

### Example Configuration

```json
{
  "detectionRules": {
    "cloudProducts": {
      "packageBased": {
        "mappings": {
          "HealthCloud": "Health Cloud",
          "omnistudio": "OmniStudio"
        }
      },
      "objectBased": {
        "Service Cloud": {
          "objects": ["Case", "CaseTeamMember"],
          "requiredObjects": ["Case"]
        }
      }
    }
  }
}
```

## Error Handling

The plugin includes comprehensive error handling:
- Retry mechanism for transient failures
- Structured logging
- Graceful degradation
- Clear error messages

## Performance

- Batch processing for large datasets
- Configurable batch sizes
- Optimized SOQL queries
- Progress indicators for long-running operations

## Security

- Input validation
- Rate limiting
- Secure credential handling
- Best practices for API usage

## Development

### Prerequisites

- Node.js 14+
- Salesforce CLI
- TypeScript

### Setup

```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Build the plugin
npm run build
```

### Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and feature requests, please create an issue in the repository. 