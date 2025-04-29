import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Connection, Org } from '@salesforce/core';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface NamedCredentialInfo {
  Id: string;
  DeveloperName: string;
  MasterLabel: string;
  Endpoint?: string;
}

interface CustomSettingInfo {
  Id: string;
  DeveloperName: string;
  MasterLabel: string;
}

interface IntegrationInfo {
  namedCredentials: NamedCredentialInfo[];
  customSettings: CustomSettingInfo[];
}

export default class OrgInventoryIntegrations extends SfCommand<IntegrationInfo> {
  public static summary = 'List integration points in the org';
  public static description = 'Retrieves a list of all integration points in the authorized Salesforce org, including named credentials and custom settings.';
  public static examples = [
    'sf org-inventory:integrations --target-org myorg',
    'sf org-inventory:integrations --target-org myorg --output-file=integrations.json',
    'sf org-inventory:integrations --target-org myorg --output-file=integrations.md --format=markdown',
    'sf org-inventory:integrations --target-org myorg --output-file=integrations.txt --format=text'
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

  public async run(): Promise<IntegrationInfo> {
    const { flags } = await this.parse(OrgInventoryIntegrations);
    const org = await Org.create({ aliasOrUsername: flags['target-org'] });
    const connection = await org.getConnection();

    this.log('Fetching integration points...');

    try {
      // Get named credentials
      const namedCredsQuery = `
        SELECT Id, DeveloperName, MasterLabel, Endpoint
        FROM NamedCredential
        ORDER BY DeveloperName
      `;
      const namedCredsResult = await connection.query<NamedCredentialInfo>(namedCredsQuery);

      // Get custom settings
      const customSettingsQuery = `
        SELECT Id, DeveloperName, MasterLabel
        FROM CustomObject
        WHERE CustomSetting = true
        ORDER BY DeveloperName
      `;
      const customSettingsResult = await connection.query<CustomSettingInfo>(customSettingsQuery);

      const integrations: IntegrationInfo = {
        namedCredentials: namedCredsResult.records,
        customSettings: customSettingsResult.records
      };

      if (integrations.namedCredentials.length === 0 && integrations.customSettings.length === 0) {
        this.log('No integration points found.');
        return integrations;
      }

      this.log('Integration Points:');

      if (flags['output-file']) {
        let content = '';
        if (flags.format === 'markdown') {
          content = this.formatMarkdown(integrations);
        } else if (flags.format === 'text') {
          content = this.formatText(integrations);
        } else {
          content = JSON.stringify(integrations, null, 2);
        }

        const outputPath = flags['output-file'].startsWith('/') ? flags['output-file'] : join(process.cwd(), flags['output-file']);
        writeFileSync(outputPath, content);
        this.log(`✅ Successfully saved integration points to ${flags['output-file']}`);
      } else {
        if (flags.format === 'markdown') {
          this.log(this.formatMarkdown(integrations));
        } else if (flags.format === 'text') {
          this.log(this.formatText(integrations));
        } else {
          this.log(JSON.stringify(integrations, null, 2));
        }
      }

      return integrations;
    } catch (error) {
      this.error(`Error fetching integration points: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private formatMarkdown(integrations: IntegrationInfo): string {
    let content = '# Integration Points\n\n';

    if (integrations.namedCredentials.length === 0 && integrations.customSettings.length === 0) {
      content += 'No integration points found.';
      return content;
    }

    if (integrations.namedCredentials.length > 0) {
      content += '## Named Credentials\n\n';
      content += '| Name | Label | Endpoint |\n';
      content += '|------|-------|----------|\n';
      integrations.namedCredentials.forEach(cred => {
        content += `| ${cred.DeveloperName} | ${cred.MasterLabel} | ${cred.Endpoint || 'N/A'} |\n`;
      });
      content += '\n';
    }

    if (integrations.customSettings.length > 0) {
      content += '## Custom Settings\n\n';
      content += '| Name | Label |\n';
      content += '|------|-------|\n';
      integrations.customSettings.forEach(setting => {
        content += `| ${setting.DeveloperName} | ${setting.MasterLabel} |\n`;
      });
    }

    return content;
  }

  private formatText(integrations: IntegrationInfo): string {
    let content = 'Integration Points:\n\n';

    if (integrations.namedCredentials.length === 0 && integrations.customSettings.length === 0) {
      content += 'No integration points found.';
      return content;
    }

    if (integrations.namedCredentials.length > 0) {
      content += 'Named Credentials:\n';
      integrations.namedCredentials.forEach(cred => {
        content += `- ${cred.DeveloperName} (${cred.MasterLabel}): ${cred.Endpoint || 'N/A'}\n`;
      });
      content += '\n';
    }

    if (integrations.customSettings.length > 0) {
      content += 'Custom Settings:\n';
      integrations.customSettings.forEach(setting => {
        content += `- ${setting.DeveloperName} (${setting.MasterLabel})\n`;
      });
    }

    return content;
  }
} 