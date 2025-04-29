# org-inventory:permission-sets

List all permission set licenses in a Salesforce org

## Description

Lists all permission set licenses in the specified org, including their status, usage information, and expiration dates.

## Examples

```bash
# List permission set licenses in an org
sf org-inventory:permission-sets --target-org myorg

# Save the list to a JSON file
sf org-inventory:permission-sets --target-org myorg --output-file=permission-sets.json

# Save the list in Markdown format
sf org-inventory:permission-sets --target-org myorg --output-file=permission-sets.md --format=markdown

# Save the list in text format
sf org-inventory:permission-sets --target-org myorg --output-file=permission-sets.txt --format=text
```

## Flags

- `--target-org=<value>`: (required) Username or alias of the target org
- `--output-file=<value>`: Path to output file where the result will be saved
- `--format=<option>`: [default: json] Format of the output file (json|markdown|text) 