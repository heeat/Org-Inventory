import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Connection, Org } from '@salesforce/core';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface OrganizationInfo {
  Id: string;
  Name: string;
  OrganizationType: string;
  IsSandbox: boolean;
  InstanceName: string;
  Features: string[];
}

interface PackageInfo {
  Id: string;
  NamespacePrefix: string;
  Status: string;
  LicenseStatus: string;
  CreatedDate: string;
  ExpirationDate?: string;
}

interface UserLicenseInfo {
  Id: string;
  Name: string;
  MasterLabel: string;
  Status: string;
  TotalLicenses: number;
  UsedLicenses: number;
}

interface PermissionSetLicenseInfo {
  Id: string;
  MasterLabel: string;
  Status: string;
  TotalLicenses: number;
  UsedLicenses: number;
  ExpirationDate?: string;
}

interface NamedCredentialInfo {
  Id: string;
  DeveloperName: string;
  MasterLabel: string;
  Endpoint?: string;
}

interface InventoryResult {
  organization: {
    name: string;
    type: string;
    isSandbox: boolean;
    instance: string;
    features: string[];
  };
  cloudProducts: Array<{
    name: string;
    status: string;
  }>;
  installedPackages: PackageInfo[];
  userLicenses: UserLicenseInfo[];
  permissionSetLicenses: PermissionSetLicenseInfo[];
  integrations: {
    namedCredentials: NamedCredentialInfo[];
  };
}

export default class OrgInventoryAll extends SfCommand<InventoryResult> {
  public static summary = 'Get comprehensive inventory of a Salesforce org';
  public static description = 'Provides a comprehensive inventory of the specified org, including organization information, cloud products, installed packages, licenses, and integration points.';
  public static examples = [
    'sf org-inventory:all --target-org myorg',
    'sf org-inventory:all --target-org myorg --output-file=inventory.json',
    'sf org-inventory:all --target-org myorg --output-file=inventory.md --format=markdown',
    'sf org-inventory:all --target-org myorg --output-file=inventory.txt --format=text'
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

  public async run(): Promise<InventoryResult> {
    const { flags } = await this.parse(OrgInventoryAll);
    const org = await Org.create({ aliasOrUsername: flags['target-org'] });
    const connection = await org.getConnection();

    this.log('Fetching comprehensive org inventory...');

    try {
      // Get organization information
      const orgQuery = `
        SELECT Id, Name, OrganizationType, IsSandbox, InstanceName
        FROM Organization
        LIMIT 1
      `;
      const orgResult = await connection.query<OrganizationInfo>(orgQuery);
      const orgInfo = orgResult.records[0];

      // Get installed packages
      const packagesQuery = `
        SELECT Id, NamespacePrefix, Status, CreatedDate
        FROM PackageLicense
        ORDER BY NamespacePrefix
      `;
      const packagesResult = await connection.query<PackageInfo>(packagesQuery);

      // Get user licenses
      const licensesQuery = `
        SELECT Id, Name, MasterLabel, Status, TotalLicenses, UsedLicenses
        FROM UserLicense
        ORDER BY Name
      `;
      const licensesResult = await connection.query<UserLicenseInfo>(licensesQuery);

      // Get permission set licenses
      const permissionSetsQuery = `
        SELECT Id, MasterLabel, Status, TotalLicenses, UsedLicenses, ExpirationDate
        FROM PermissionSetLicense
        ORDER BY MasterLabel
      `;
      const permissionSetsResult = await connection.query<PermissionSetLicenseInfo>(permissionSetsQuery);

      // Get named credentials
      const namedCredsQuery = `
        SELECT Id, DeveloperName, MasterLabel, Endpoint
        FROM NamedCredential
        ORDER BY DeveloperName
      `;
      const namedCredsResult = await connection.query<NamedCredentialInfo>(namedCredsQuery);

      // Compile all information
      const inventory: InventoryResult = {
        organization: {
          name: orgInfo.Name,
          type: orgInfo.OrganizationType,
          isSandbox: orgInfo.IsSandbox,
          instance: orgInfo.InstanceName,
          features: orgInfo.Features
        },
        cloudProducts: await this.getCloudProducts(orgInfo, connection),
        installedPackages: packagesResult.records,
        userLicenses: licensesResult.records,
        permissionSetLicenses: permissionSetsResult.records,
        integrations: {
          namedCredentials: namedCredsResult.records
        }
      };

      // Format the output based on the selected format
      if (flags['output-file']) {
        let content = '';
        if (flags.format === 'markdown') {
          content = this.formatMarkdown(inventory);
        } else if (flags.format === 'text') {
          content = this.formatText(inventory);
        } else {
          content = JSON.stringify(inventory, null, 2);
        }

        const outputPath = flags['output-file'].startsWith('/') ? flags['output-file'] : join(process.cwd(), flags['output-file']);
        writeFileSync(outputPath, content);
        this.log(`✅ Successfully saved comprehensive inventory to ${flags['output-file']}`);
      } else {
        if (flags.format === 'markdown') {
          this.log(this.formatMarkdown(inventory));
        } else if (flags.format === 'text') {
          this.log(this.formatText(inventory));
        } else {
          this.log(JSON.stringify(inventory, null, 2));
        }
      }

      return inventory;
    } catch (error) {
      this.error(`Error fetching comprehensive inventory: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private async getCloudProducts(orgInfo: OrganizationInfo, connection: Connection): Promise<Array<{ name: string; status: string }>> {
    const cloudProducts: Array<{ name: string; status: string }> = [];
    
    // Always add Platform as it's the base
    cloudProducts.push({ name: 'Salesforce Platform', status: 'Enabled' });

    // Check for installed packages that indicate cloud products
    try {
      const packagesQuery = `
        SELECT Id, NamespacePrefix, Status
        FROM PackageLicense
        ORDER BY NamespacePrefix
      `;
      const packagesResult = await connection.query(packagesQuery);
      
      // Map of namespace prefixes to cloud products
      const packageToCloudMap: { [key: string]: string } = {
        'HealthCloud': 'Health Cloud',
        'omnistudio': 'OmniStudio',
        'oneview': 'OneView',
        'SocialService': 'Social Service',
        'sf_chttr_apps': 'Chatter',
        'sf_com_apps': 'Community',
        'SCSConnectedApp': 'Service Cloud',
        'OIQ': 'OmniStudio',
        'HealthCloudFlow': 'Health Cloud',
        'HealthCloudGA': 'Health Cloud'
      };

      // Add cloud products based on installed packages
      packagesResult.records.forEach((pkg: any) => {
        if (packageToCloudMap[pkg.NamespacePrefix]) {
          cloudProducts.push({ 
            name: packageToCloudMap[pkg.NamespacePrefix], 
            status: 'Enabled' 
          });
        }
      });
    } catch (error) {
      // Continue even if package query fails
    }

    // Check for specific objects and settings that indicate cloud products
    try {
      // Check for Service Cloud
      const serviceCloudQuery = `
        SELECT Id FROM Case LIMIT 1
      `;
      const serviceCloudResult = await connection.query(serviceCloudQuery);
      if (serviceCloudResult.records.length > 0) {
        cloudProducts.push({ name: 'Service Cloud', status: 'Enabled' });
      }
    } catch (error) {
      // Service Cloud not enabled
    }

    try {
      // Check for Sales Cloud
      const salesCloudQuery = `
        SELECT Id FROM Opportunity LIMIT 1
      `;
      const salesCloudResult = await connection.query(salesCloudQuery);
      if (salesCloudResult.records.length > 0) {
        cloudProducts.push({ name: 'Sales Cloud', status: 'Enabled' });
      }
    } catch (error) {
      // Sales Cloud not enabled
    }

    try {
      // Check for Experience Cloud
      const experienceCloudQuery = `
        SELECT Id FROM Network LIMIT 1
      `;
      const experienceCloudResult = await connection.query(experienceCloudQuery);
      if (experienceCloudResult.records.length > 0) {
        cloudProducts.push({ name: 'Experience Cloud', status: 'Enabled' });
      }
    } catch (error) {
      // Experience Cloud not enabled
    }

    try {
      // Check for Field Service
      const fieldServiceQuery = `
        SELECT Id FROM ServiceResource LIMIT 1
      `;
      const fieldServiceResult = await connection.query(fieldServiceQuery);
      if (fieldServiceResult.records.length > 0) {
        cloudProducts.push({ name: 'Field Service', status: 'Enabled' });
      }
    } catch (error) {
      // Field Service not enabled
    }

    try {
      // Check for Marketing Cloud
      const marketingCloudQuery = `
        SELECT Id FROM Campaign LIMIT 1
      `;
      const marketingCloudResult = await connection.query(marketingCloudQuery);
      if (marketingCloudResult.records.length > 0) {
        cloudProducts.push({ name: 'Marketing Cloud', status: 'Enabled' });
      }
    } catch (error) {
      // Marketing Cloud not enabled
    }

    try {
      // Check for Analytics Cloud
      const analyticsCloudQuery = `
        SELECT Id FROM AnalyticsSettings LIMIT 1
      `;
      const analyticsCloudResult = await connection.query(analyticsCloudQuery);
      if (analyticsCloudResult.records.length > 0) {
        cloudProducts.push({ name: 'Analytics Cloud', status: 'Enabled' });
      }
    } catch (error) {
      // Analytics Cloud not enabled
    }

    // Remove duplicates
    const uniqueProducts = Array.from(new Set(cloudProducts.map(p => p.name)))
      .map(name => cloudProducts.find(p => p.name === name)!);

    return uniqueProducts;
  }

  private formatMarkdown(inventory: InventoryResult): string {
    let content = '# Salesforce Org Inventory\n\n';

    // Organization Information
    content += '## Organization Information\n\n';
    content += `- Name: ${inventory.organization.name}\n`;
    content += `- Type: ${inventory.organization.type}\n`;
    content += `- Is Sandbox: ${inventory.organization.isSandbox ? 'Yes' : 'No'}\n`;
    content += `- Instance: ${inventory.organization.instance}\n\n`;

    // Cloud Products
    content += '## Enabled Cloud Products\n\n';
    if (inventory.cloudProducts.length > 0) {
      inventory.cloudProducts.forEach(product => {
        content += `- ${product.name}\n`;
      });
    } else {
      content += 'No cloud products found.\n';
    }
    content += '\n';

    // Installed Packages
    content += '## Installed Packages\n\n';
    if (inventory.installedPackages.length > 0) {
      content += '| Namespace | Status | Licenses | Created Date | Expiration Date |\n';
      content += '|-----------|--------|----------|--------------|----------------|\n';
      inventory.installedPackages.forEach(pkg => {
        content += `| ${pkg.NamespacePrefix || 'N/A'} | ${pkg.Status} | ${pkg.LicenseStatus} | ${pkg.CreatedDate} | ${pkg.ExpirationDate || 'Never'} |\n`;
      });
    } else {
      content += 'No installed packages found.\n';
    }
    content += '\n';

    // User Licenses
    content += '## User Licenses\n\n';
    if (inventory.userLicenses.length > 0) {
      content += '| License Name | Status | Used/Total |\n';
      content += '|-------------|--------|------------|\n';
      inventory.userLicenses.forEach(license => {
        content += `| ${license.MasterLabel} | ${license.Status} | ${license.UsedLicenses}/${license.TotalLicenses} |\n`;
      });
    } else {
      content += 'No user licenses found.\n';
    }
    content += '\n';

    // Permission Set Licenses
    content += '## Permission Set Licenses\n\n';
    if (inventory.permissionSetLicenses.length > 0) {
      content += '| License Name | Status | Used/Total | Expiration Date |\n';
      content += '|-------------|--------|------------|----------------|\n';
      inventory.permissionSetLicenses.forEach(license => {
        content += `| ${license.MasterLabel} | ${license.Status} | ${license.UsedLicenses}/${license.TotalLicenses} | ${license.ExpirationDate || 'Never'} |\n`;
      });
    } else {
      content += 'No permission set licenses found.\n';
    }
    content += '\n';

    // Integration Points
    content += '## Integration Points\n\n';
    if (inventory.integrations.namedCredentials.length > 0) {
      content += '### Named Credentials\n\n';
      content += '| Name | Label | Endpoint |\n';
      content += '|------|-------|----------|\n';
      inventory.integrations.namedCredentials.forEach(cred => {
        content += `| ${cred.DeveloperName} | ${cred.MasterLabel} | ${cred.Endpoint || 'N/A'} |\n`;
      });
    } else {
      content += 'No integration points found.\n';
    }

    return content;
  }

  private formatText(inventory: InventoryResult): string {
    let content = 'Salesforce Org Inventory\n\n';

    // Organization Information
    content += 'Organization Information:\n';
    content += `- Name: ${inventory.organization.name}\n`;
    content += `- Type: ${inventory.organization.type}\n`;
    content += `- Is Sandbox: ${inventory.organization.isSandbox ? 'Yes' : 'No'}\n`;
    content += `- Instance: ${inventory.organization.instance}\n\n`;

    // Cloud Products
    content += 'Enabled Cloud Products:\n';
    if (inventory.cloudProducts.length > 0) {
      inventory.cloudProducts.forEach(product => {
        content += `- ${product.name}\n`;
      });
    } else {
      content += 'No cloud products found.\n';
    }
    content += '\n';

    // Installed Packages
    content += 'Installed Packages:\n';
    if (inventory.installedPackages.length > 0) {
      inventory.installedPackages.forEach(pkg => {
        content += `- ${pkg.NamespacePrefix || 'N/A'}: ${pkg.Status} (${pkg.LicenseStatus})\n`;
        content += `  Created: ${pkg.CreatedDate}\n`;
        content += `  Expires: ${pkg.ExpirationDate || 'Never'}\n`;
      });
    } else {
      content += 'No installed packages found.\n';
    }
    content += '\n';

    // User Licenses
    content += 'User Licenses:\n';
    if (inventory.userLicenses.length > 0) {
      inventory.userLicenses.forEach(license => {
        content += `- ${license.MasterLabel}: ${license.Status} (${license.UsedLicenses}/${license.TotalLicenses})\n`;
      });
    } else {
      content += 'No user licenses found.\n';
    }
    content += '\n';

    // Permission Set Licenses
    content += 'Permission Set Licenses:\n';
    if (inventory.permissionSetLicenses.length > 0) {
      inventory.permissionSetLicenses.forEach(license => {
        content += `- ${license.MasterLabel}: ${license.Status} (${license.UsedLicenses}/${license.TotalLicenses})\n`;
        content += `  Expires: ${license.ExpirationDate || 'Never'}\n`;
      });
    } else {
      content += 'No permission set licenses found.\n';
    }
    content += '\n';

    // Integration Points
    content += 'Integration Points:\n';
    if (inventory.integrations.namedCredentials.length > 0) {
      content += 'Named Credentials:\n';
      inventory.integrations.namedCredentials.forEach(cred => {
        content += `- ${cred.DeveloperName} (${cred.MasterLabel}): ${cred.Endpoint || 'N/A'}\n`;
      });
    } else {
      content += 'No integration points found.\n';
    }

    return content;
  }
} 