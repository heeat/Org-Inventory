import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Connection, Org } from '@salesforce/core';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface PermissionSetLicenseInfo {
  Id: string;
  MasterLabel: string;
  Status: string;
  TotalLicenses: number;
  UsedLicenses: number;
  ExpirationDate?: string;
}

export default class OrgInventoryPermissionSets extends SfCommand<PermissionSetLicenseInfo[]> {
  public static summary = 'List permission set licenses in the org';
  public static description = 'Retrieves a list of all permission set licenses in the authorized Salesforce org with their usage information.';
  public static examples = [
    'sf org-inventory:permission-sets --target-org myorg',
    'sf org-inventory:permission-sets --target-org myorg --output-file=permission-sets.json',
    'sf org-inventory:permission-sets --target-org myorg --output-file=permission-sets.md --format=markdown',
    'sf org-inventory:permission-sets --target-org myorg --output-file=permission-sets.txt --format=text'
  ];

  public static flags = {
    'target-org': Flags.string({
      char: 'o',
      description: 'Username or alias of the target org',
      required: true,
    }),
    'output-file': Flags.string({
      char: 'f',
      description: 'Path to output file where the result will be saved',
    }),
    format: Flags.string({
      char: 'F',
      description: 'Format of the output file (json|markdown|text)',
      options: ['json', 'markdown', 'text'],
      default: 'json',
    }),
  };

  public async run(): Promise<PermissionSetLicenseInfo[]> {
    const { flags } = await this.parse(OrgInventoryPermissionSets);
    const org = await Org.create({ aliasOrUsername: flags['target-org'] });
    const connection = await org.getConnection();

    this.log('Fetching permission set licenses...');

    try {
      const query = `
        SELECT Id, MasterLabel, Status, TotalLicenses, UsedLicenses, ExpirationDate
        FROM PermissionSetLicense
        ORDER BY MasterLabel
      `;

      const result = await connection.query<PermissionSetLicenseInfo>(query);
      const licenses = result.records;

      if (licenses.length === 0) {
        this.log('No permission set licenses found.');
        return [];
      }

      this.log(`Found ${licenses.length} permission set licenses:`);

      if (flags['output-file']) {
        let content = '';
        if (flags.format === 'markdown') {
          content = this.formatMarkdown(licenses);
        } else if (flags.format === 'text') {
          content = this.formatText(licenses);
        } else {
          content = JSON.stringify(licenses, null, 2);
        }

        const outputPath = flags['output-file'].startsWith('/') ? flags['output-file'] : join(process.cwd(), flags['output-file']);
        writeFileSync(outputPath, content);
        this.log(`✅ Successfully saved permission set licenses to ${flags['output-file']}`);
      } else {
        if (flags.format === 'markdown') {
          this.log(this.formatMarkdown(licenses));
        } else if (flags.format === 'text') {
          this.log(this.formatText(licenses));
        } else {
          this.log(JSON.stringify(licenses, null, 2));
        }
      }

      return licenses;
    } catch (error) {
      this.error(`Error fetching permission set licenses: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private formatMarkdown(licenses: PermissionSetLicenseInfo[]): string {
    let content = '# Permission Set Licenses\n\n';

    if (licenses.length === 0) {
      content += 'No permission set licenses found.';
      return content;
    }

    content += '| License Name | Status | Used/Total | Expiration Date |\n';
    content += '|-------------|--------|------------|----------------|\n';

    licenses.forEach(license => {
      content += `| ${license.MasterLabel} | ${license.Status} | ${license.UsedLicenses}/${license.TotalLicenses} | ${license.ExpirationDate || 'Never'} |\n`;
    });

    return content;
  }

  private formatText(licenses: PermissionSetLicenseInfo[]): string {
    let content = 'Permission Set Licenses:\n\n';

    if (licenses.length === 0) {
      content += 'No permission set licenses found.';
      return content;
    }

    licenses.forEach(license => {
      content += `${license.MasterLabel}: ${license.Status} (${license.UsedLicenses}/${license.TotalLicenses})\n`;
      content += `  Expires: ${license.ExpirationDate || 'Never'}\n`;
    });

    return content;
  }
} 