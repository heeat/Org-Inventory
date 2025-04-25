import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Connection, Org } from '@salesforce/core';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Interface for package license information
interface PackageInfo {
  Id: string;
  NamespacePrefix: string;
  Status: string;
  AllowedLicenses: number;
  UsedLicenses: number;
  CreatedDate: string;
  ExpirationDate?: string;
}

// Command class for listing installed packages
export default class OrgInventoryList extends SfCommand<PackageInfo[]> {
  // Command summary shown in the help output
  public static summary = 'List all installed packages in the org';
  
  // Extended description shown in the help command
  public static description = 'Retrieves a list of all installed packages in the authorized Salesforce org with their version numbers and descriptions.';
  
  // Command examples shown in the help output
  public static examples = [
    'sf org-inventory:list --target-org myorg',
    'sf org-inventory:list --target-org myorg --output-file=packages.json',
    'sf org-inventory:list --target-org myorg --output-file=packages.md --format=markdown',
    'sf org-inventory:list --target-org myorg --output-file=packages.txt --format=text'
  ];

  // Command line flags/options
  public static flags = {
    'target-org': Flags.string({
      char: 'o',
      description: 'Login username or alias for the target org',
      summary: 'Login username or alias for the target org',
      required: true,
      deprecateAliases: true,
      aliases: ['targetusername', 'u']
    }),
    'output-file': Flags.string({
      char: 'f',
      summary: 'Path to output file where the result will be saved',
      description: 'Specify a file name to save the output. If not provided, output will be displayed in the console.'
    }),
    format: Flags.string({
      char: 't',
      summary: 'Format of the output file (json, markdown, text)',
      description: 'Specify the format for the output file. Options are json, markdown, or text.',
      options: ['json', 'markdown', 'text'],
      default: 'json'
    })
  };

  // Main run method for the command
  public async run(): Promise<PackageInfo[]> {
    // Get command flags
    const { flags } = await this.parse(OrgInventoryList);
    
    // Log instead of spinner due to compatibility issues
    this.log('Fetching installed packages...');

    try {
      // Get org based on the target-org flag
      const org = await Org.create({ aliasOrUsername: flags['target-org'] });
      const connection = await org.getConnection();

      // SOQL query to get installed packages
      const query = `
        SELECT 
          Id, 
          NamespacePrefix, 
          Status,
          AllowedLicenses,
          UsedLicenses,
          CreatedDate,
          ExpirationDate
        FROM PackageLicense
        ORDER BY NamespacePrefix
      `;

      // Execute query using the connection
      const queryResult = await connection.query<PackageInfo>(query);
      const packages = queryResult.records;

      // Handle output based on flags
      if (flags['output-file']) {
        // Write output to file in the specified format
        this.writeOutputFile(packages, flags['output-file'], flags.format);
        this.log(`✅ Successfully saved installed packages to ${flags['output-file']}`);
      } else {
        // Display packages in console
        this.displayPackages(packages);
      }

      return packages;
    } catch (error) {
      // Handle errors
      this.error(error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  // Helper method to display packages in the console
  private displayPackages(packages: PackageInfo[]): void {
    if (packages.length === 0) {
      this.log('No installed packages found in the org.');
      return;
    }

    this.log(`Found ${packages.length} installed packages:`);

    // Create columns definition for table
    const columns = {
      Namespace: { header: 'Namespace' },
      Status: { header: 'Status' },
      Licenses: { header: 'Licenses' },
      CreatedDate: { header: 'Created Date' },
      ExpirationDate: { header: 'Expiration Date' }
    };
    
    // Create data for table
    const tableData = packages.map(pkg => ({
      Namespace: pkg.NamespacePrefix || 'N/A',
      Status: pkg.Status || '',
      Licenses: `${pkg.UsedLicenses}/${pkg.AllowedLicenses === -1 ? 'Unlimited' : pkg.AllowedLicenses}`,
      CreatedDate: this.formatDate(pkg.CreatedDate),
      ExpirationDate: pkg.ExpirationDate ? this.formatDate(pkg.ExpirationDate) : 'Never'
    }));
    
    // Display table with packages
    this.table(tableData, columns);
  }

  // Helper method to format date
  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return dateStr;
    }
  }

  // Helper method to write output to a file in the specified format
  private writeOutputFile(packages: PackageInfo[], filePath: string, format: string): void {
    let content = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(this.transformPackages(packages), null, 2);
        break;
      case 'markdown':
        content = this.formatAsMarkdown(packages);
        break;
      case 'text':
        content = this.formatAsText(packages);
        break;
      default:
        content = JSON.stringify(this.transformPackages(packages), null, 2);
    }

    // Use absolute path if provided, otherwise resolve from current directory
    const outputPath = filePath.startsWith('/') ? filePath : join(process.cwd(), filePath);
    writeFileSync(outputPath, content);
  }

  // Helper method to transform packages for output
  private transformPackages(packages: PackageInfo[]): any[] {
    return packages.map(pkg => ({
      Namespace: pkg.NamespacePrefix || 'N/A',
      Status: pkg.Status || '',
      AllowedLicenses: pkg.AllowedLicenses,
      UsedLicenses: pkg.UsedLicenses,
      CreatedDate: pkg.CreatedDate,
      ExpirationDate: pkg.ExpirationDate || 'Never',
      Id: pkg.Id
    }));
  }

  // Helper method to format packages as markdown
  private formatAsMarkdown(packages: PackageInfo[]): string {
    if (packages.length === 0) {
      return '# Installed Packages\n\nNo installed packages found in the org.';
    }

    let markdown = '# Installed Packages\n\n';
    markdown += '| Namespace | Status | Licenses | Created Date | Expiration Date |\n';
    markdown += '|-----------|--------|----------|--------------|----------------|\n';

    packages.forEach(pkg => {
      const licenses = `${pkg.UsedLicenses}/${pkg.AllowedLicenses === -1 ? 'Unlimited' : pkg.AllowedLicenses}`;
      const created = this.formatDate(pkg.CreatedDate);
      const expiration = pkg.ExpirationDate ? this.formatDate(pkg.ExpirationDate) : 'Never';
      
      markdown += `| ${pkg.NamespacePrefix || 'N/A'} | ${pkg.Status || ''} | ${licenses} | ${created} | ${expiration} |\n`;
    });

    return markdown;
  }

  // Helper method to format packages as plain text
  private formatAsText(packages: PackageInfo[]): string {
    if (packages.length === 0) {
      return 'Installed Packages\n\nNo installed packages found in the org.';
    }

    let text = 'Installed Packages\n\n';

    packages.forEach(pkg => {
      text += `Namespace: ${pkg.NamespacePrefix || 'N/A'}\n`;
      text += `Status: ${pkg.Status || ''}\n`;
      text += `Licenses: ${pkg.UsedLicenses}/${pkg.AllowedLicenses === -1 ? 'Unlimited' : pkg.AllowedLicenses}\n`;
      text += `Created Date: ${this.formatDate(pkg.CreatedDate)}\n`;
      text += `Expiration Date: ${pkg.ExpirationDate ? this.formatDate(pkg.ExpirationDate) : 'Never'}\n\n`;
    });

    return text;
  }
} 