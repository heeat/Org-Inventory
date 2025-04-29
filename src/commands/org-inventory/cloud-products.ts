import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Connection, Org } from '@salesforce/core';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface CloudProductInfo {
  name: string;
  status: string;
}

export default class OrgInventoryCloudProducts extends SfCommand<CloudProductInfo[]> {
  public static summary = 'List cloud products in the org';
  public static description = 'Retrieves a list of all enabled cloud products in the authorized Salesforce org.';
  public static examples = [
    'sf org-inventory:cloud-products --target-org myorg',
    'sf org-inventory:cloud-products --target-org myorg --output-file=cloud-products.json',
    'sf org-inventory:cloud-products --target-org myorg --output-file=cloud-products.md --format=markdown',
    'sf org-inventory:cloud-products --target-org myorg --output-file=cloud-products.txt --format=text'
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

  public async run(): Promise<CloudProductInfo[]> {
    const { flags } = await this.parse(OrgInventoryCloudProducts);
    const org = await Org.create({ aliasOrUsername: flags['target-org'] });
    const connection = await org.getConnection();

    this.log('Fetching cloud products...');

    try {
      const query = `
        SELECT Id, Name, OrganizationType, IsSandbox, InstanceName
        FROM Organization
        LIMIT 1
      `;

      const result = await connection.query(query);
      
      if (result.records.length === 0) {
        this.log('No organization information found.');
        return [];
      }

      const orgInfo = result.records[0];
      const cloudProducts = await this.getCloudProducts(orgInfo, connection);

      if (cloudProducts.length === 0) {
        this.log('No cloud products found.');
        return [];
      }

      this.log('Enabled Cloud Products:');

      if (flags['output-file']) {
        let content = '';
        if (flags.format === 'markdown') {
          content = this.formatMarkdown(cloudProducts);
        } else if (flags.format === 'text') {
          content = this.formatText(cloudProducts);
        } else {
          content = JSON.stringify(cloudProducts, null, 2);
        }

        const outputPath = flags['output-file'].startsWith('/') ? flags['output-file'] : join(process.cwd(), flags['output-file']);
        writeFileSync(outputPath, content);
        this.log(`✅ Successfully saved cloud products to ${flags['output-file']}`);
      } else {
        if (flags.format === 'markdown') {
          this.log(this.formatMarkdown(cloudProducts));
        } else if (flags.format === 'text') {
          this.log(this.formatText(cloudProducts));
        } else {
          this.log(JSON.stringify(cloudProducts, null, 2));
        }
      }

      return cloudProducts;
    } catch (error) {
      this.error(`Error fetching cloud products: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private async getCloudProducts(orgInfo: any, connection: Connection): Promise<CloudProductInfo[]> {
    const cloudProducts: CloudProductInfo[] = [];
    
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

  private formatMarkdown(products: CloudProductInfo[]): string {
    let content = '# Cloud Products\n\n';

    if (products.length === 0) {
      content += 'No cloud products found.';
      return content;
    }

    content += '| Product Name | Status |\n';
    content += '|-------------|--------|\n';

    products.forEach(product => {
      content += `| ${product.name} | ${product.status} |\n`;
    });

    return content;
  }

  private formatText(products: CloudProductInfo[]): string {
    let content = 'Cloud Products:\n\n';

    if (products.length === 0) {
      content += 'No cloud products found.';
      return content;
    }

    products.forEach(product => {
      content += `- ${product.name} (${product.status})\n`;
    });

    return content;
  }
} 