import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Connection, Org } from '@salesforce/core';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Interface for package license information retrieved from Salesforce
 * Contains details about installed packages and their licensing
 */
interface PackageInfo {
  Id: string;
  NamespacePrefix: string;
  Status: string;
  AllowedLicenses: number;
  UsedLicenses: number;
  CreatedDate: string;
  ExpirationDate?: string;
}

/**
 * Salesforce CLI command to list all installed packages in an org
 * Provides information about package namespace, status, licensing, and dates
 * Supports multiple output formats: console display, JSON, Markdown, and text
 */
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

  /**
   * Main execution method for the command
   * 1. Parses command flags
   * 2. Connects to the Salesforce org
   * 3. Queries for installed packages
   * 4. Displays or saves the results based on provided flags
   * 
   * @returns Promise containing the list of package information
   * @throws Error if connection fails or query execution fails
   */
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

  /**
   * Displays the package information in a formatted table in the console
   * Creates a table with columns for Namespace, Status, Licenses, Created Date, and Expiration Date
   * Formats license information as "Used/Total" or "Used/Unlimited"
   * 
   * @param packages Array of PackageInfo objects to display
   */
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

  /**
   * Formats a date string into YYYY-MM-DD format
   * Takes a date string from Salesforce and converts it to a more readable format
   * 
   * @param dateStr The date string to format (typically in ISO format)
   * @returns Formatted date string in YYYY-MM-DD format or empty string if input is invalid
   */
  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return dateStr;
    }
  }

  /**
   * Writes package information to a file in the specified format
   * Supports multiple output formats: JSON, Markdown, and plain text
   * 
   * @param packages Array of PackageInfo objects to write to file
   * @param filePath Path where the file should be written
   * @param format The format to use: 'json', 'markdown', or 'text'
   */
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

  /**
   * Transforms raw package data into a more user-friendly format
   * Creates a clean object with well-named properties and formatted values
   * 
   * @param packages Array of raw PackageInfo objects from Salesforce
   * @returns Array of transformed objects with formatted properties
   */
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

  /**
   * Formats package information as markdown
   * Creates a markdown table with headers and rows for each package
   * 
   * @param packages Array of PackageInfo objects to format
   * @returns Markdown formatted string with package information
   */
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

  /**
   * Formats package information as plain text
   * Creates a text representation with each package's details in a readable format
   * 
   * @param packages Array of PackageInfo objects to format
   * @returns Plain text string with package information
   */
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