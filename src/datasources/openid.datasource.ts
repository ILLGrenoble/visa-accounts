import { APPLICATION_CONFIG } from '../application-config';
import { Client, Issuer, UserinfoResponse } from 'openid-client';
import { AuthenticationError, logger } from '../utils';

export class OpenIDDataSource  {
  static dataSourceName = 'open-id';

  private _client: Client;
  private _clientPromise: Promise<Client>;
 
  get client(): Promise<Client> {
    return (async () => {
      let client = this._client;
    
      if (client == null && this._clientPromise == null) {
        logger.info('Initialising openid provider');
        this._clientPromise = this._createClient();
        client = this._client = await this._clientPromise;
        logger.info('Set the client in provider');

      } else if (client == null && this._clientPromise != null) {
        logger.info('Waiting for openid provider');
        client = await this._clientPromise;
        logger.info('Got openid provider');
      }

      return client;
    })();
  }

  constructor() {
    logger.debug('Creating OpenIDDataSource');
  }

  /**
   * Create client for the OpenID connect provider
   */
  async start(): Promise<void> {
    if (process.env.NODE_ENV === 'dev') {
      return;
    }

    await this.client;
  }

  async authenticate(token: string): Promise<UserinfoResponse> {
    try {
      const client = await this.client;
      const userInfo = await client.userinfo(token);
      return userInfo;
    
    } catch (error) {
      if (error instanceof Error) {
        throw new AuthenticationError(`Authentication error: ${error.message}`);

      } else {
        throw new AuthenticationError(`Authentication error: ${error}`);
      }
    }
  }

  private async _createClient(): Promise<Client> {
    const idpUrl = APPLICATION_CONFIG().idp.url;
    const clientId = APPLICATION_CONFIG().idp.clientId;

    try {
      logger.debug('Creating new OpenID connect client');
      const issuer = await Issuer.discover(idpUrl);
      const client = new issuer.Client({
        client_id: clientId
      });

      return client;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Could not create client for OpenID Connect provider at ${idpUrl} : ${error.message}`);

      } else {
        logger.error(`Could not create client for OpenID Connect provider at ${idpUrl} : ${error}`);
      }

      process.exit();
    }
  }

}
