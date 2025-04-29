# org-inventory:integrations

List all integration points in a Salesforce org

## Description

Lists all integration points in the specified org, including named credentials and custom settings that might be used for integrations.

## Examples

```bash
# List integration points in an org
sf org-inventory:integrations --target-org myorg

# Save the list to a JSON file
sf org-inventory:integrations --target-org myorg --output-file=integrations.json

# Save the list in Markdown format
sf org-inventory:integrations --target-org myorg --output-file=integrations.md --format=markdown

# Save the list in text format
sf org-inventory:integrations --target-org myorg --output-file=integrations.txt --format=text
```

## Flags

- `--target-org=<value>`: (required) Username or alias of the target org
- `--output-file=<value>`: Path to output file where the result will be saved
- `--format=<option>`: [default: json] Format of the output file (json|markdown|text) 