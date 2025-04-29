# org-inventory:cloud-products

List all enabled cloud products in a Salesforce org

## Description

Lists all enabled cloud products in the specified org, such as Sales Cloud, Service Cloud, Health Cloud, etc.

## Examples

```bash
# List enabled cloud products in an org
sf org-inventory:cloud-products --target-org myorg

# Save the list to a JSON file
sf org-inventory:cloud-products --target-org myorg --output-file=cloud-products.json

# Save the list in Markdown format
sf org-inventory:cloud-products --target-org myorg --output-file=cloud-products.md --format=markdown

# Save the list in text format
sf org-inventory:cloud-products --target-org myorg --output-file=cloud-products.txt --format=text
```

## Flags

- `--target-org=<value>`: (required) Username or alias of the target org
- `--output-file=<value>`: Path to output file where the result will be saved
- `--format=<option>`: [default: json] Format of the output file (json|markdown|text) 