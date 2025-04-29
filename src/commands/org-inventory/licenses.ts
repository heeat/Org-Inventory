import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Connection, Org } from '@salesforce/core';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface LicenseInfo {
  Id: string;
  Name: string;
  MasterLabel: string;
  Status: string;
  TotalLicenses: number;
  UsedLicenses: number;
}

export default class OrgInventoryLicenses extends SfCommand<LicenseInfo[]> {
  public static summary = 'List user licenses in the org';
  public static description = 'Retrieves a list of all user licenses in the authorized Salesforce org with their usage information.';
  public static examples = [
    'sf org-inventory:licenses --target-org myorg',
    'sf org-inventory:licenses --target-org myorg --output-file=licenses.json',
    'sf org-inventory:licenses --target-org myorg --output-file=licenses.md --format=markdown',
    'sf org-inventory:licenses --target-org myorg --output-file=licenses.txt --format=text'
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

  public async run(): Promise<LicenseInfo[]> {
    const { flags } = await this.parse(OrgInventoryLicenses);
    const org = await Org.create({ aliasOrUsername: flags['target-org'] });
    const connection = await org.getConnection();

    this.log('Fetching user licenses...');

    try {
      const query = `
        SELECT Id, Name, MasterLabel, Status, TotalLicenses, UsedLicenses
        FROM UserLicense
        ORDER BY Name
      `;

      const result = await connection.query<LicenseInfo>(query);
      const licenses = result.records;

      if (licenses.length === 0) {
        this.log('No user licenses found.');
        return [];
      }

      this.log(`Found ${licenses.length} user licenses:`);

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
        this.log(`✅ Successfully saved user licenses to ${flags['output-file']}`);
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
      this.error(`Error fetching user licenses: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private formatMarkdown(licenses: LicenseInfo[]): string {
    let content = '# User Licenses\n\n';

    if (licenses.length === 0) {
      content += 'No user licenses found.';
      return content;
    }

    content += '| License Name | Status | Used/Total |\n';
    content += '|-------------|--------|------------|\n';

    licenses.forEach(license => {
      content += `| ${license.MasterLabel} | ${license.Status} | ${license.UsedLicenses}/${license.TotalLicenses} |\n`;
    });

    return content;
  }

  private formatText(licenses: LicenseInfo[]): string {
    let content = 'User Licenses:\n\n';

    if (licenses.length === 0) {
      content += 'No user licenses found.';
      return content;
    }

    licenses.forEach(license => {
      content += `${license.MasterLabel}: ${license.Status} (${license.UsedLicenses}/${license.TotalLicenses})\n`;
    });

    return content;
  }
} 