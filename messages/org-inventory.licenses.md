# org-inventory:licenses

List all user licenses in a Salesforce org

## Description

Lists all user licenses in the specified org, including their status and usage information.

## Examples

```bash
# List user licenses in an org
sf org-inventory:licenses --target-org myorg

# Save the list to a JSON file
sf org-inventory:licenses --target-org myorg --output-file=licenses.json

# Save the list in Markdown format
sf org-inventory:licenses --target-org myorg --output-file=licenses.md --format=markdown

# Save the list in text format
sf org-inventory:licenses --target-org myorg --output-file=licenses.txt --format=text
```

## Flags

- `--target-org=<value>`: (required) Username or alias of the target org
- `--output-file=<value>`: Path to output file where the result will be saved
- `--format=<option>`: [default: json] Format of the output file (json|markdown|text) 