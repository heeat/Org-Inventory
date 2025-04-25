declare module 'jsforce' {
  export interface JwtOAuth2Config extends OAuth2Config {
    privateKey?: string;
  }
  
  export interface OAuth2Config {
    clientId?: string;
    clientSecret?: string;
    loginUrl?: string;
    redirectUri?: string;
  }
  
  export class OAuth2 {
    constructor(options?: OAuth2Config);
  }
  
  export interface ConnectionConfig<S = any> {
    loginUrl?: string;
    instanceUrl?: string;
    refreshToken?: string;
    accessToken?: string;
    version?: string;
    maxRequest?: number;
  }
  
  export interface HttpRequest {
    url: string;
    method: string;
    headers?: object;
    body?: string | object;
  }
  
  export interface QueryOptions {
    scanAll?: boolean;
    limit?: number;
    offset?: number;
  }
  
  export interface QueryResult<T> {
    done: boolean;
    totalSize: number;
    records: T[];
    nextRecordsUrl?: string;
  }
  
  export interface Record {
    Id: string;
    attributes: { type: string; url: string };
  }
  
  export interface Schema {
    SObjects: {
      [key: string]: any;
    };
    [key: string]: any;
  }
  
  export class Connection<S = any> {
    _conn: any;
    query<T>(soql: string, options?: QueryOptions): Promise<QueryResult<T>>;
  }
  
  export type JSForceConnection<S> = Connection<S>;
  export type JSForceTooling<S> = any;
  export type AsyncResult = any;
  export type DeployResultLocator<T> = any;
} 