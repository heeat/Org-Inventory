# org-inventory:all

Get comprehensive inventory of a Salesforce org

## Description

Provides a comprehensive inventory of the specified org, including:
- Organization information
- Enabled cloud products
- Installed packages
- User licenses
- Permission set licenses
- Integration points

## Examples

```bash
# Get comprehensive inventory of an org
sf org-inventory:all --target-org myorg

# Save the inventory to a JSON file
sf org-inventory:all --target-org myorg --output-file=inventory.json

# Save the inventory in Markdown format
sf org-inventory:all --target-org myorg --output-file=inventory.md --format=markdown

# Save the inventory in text format
sf org-inventory:all --target-org myorg --output-file=inventory.txt --format=text
```

## Flags

- `--target-org=<value>`: (required) Username or alias of the target org
- `--output-file=<value>`: Path to output file where the result will be saved
- `--format=<option>`: [default: json] Format of the output file (json|markdown|text) 