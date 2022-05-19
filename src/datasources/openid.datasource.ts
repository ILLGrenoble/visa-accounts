import { APPLICATION_CONFIG } from '../application-config';
import { Client, custom, HttpOptions, Issuer, UserinfoResponse } from 'openid-client';
import { decode } from 'jsonwebtoken';
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
      // Verify that the access token is for the correct client
      const jwt = decode(token, {complete: true});
      if (jwt.payload['azp'] && jwt.payload['azp'] !== APPLICATION_CONFIG().idp.clientId) {
        throw new AuthenticationError('Token does not correspond to the client');
      }

      const client = await this.client;
      const userInfo = await client.userinfo(token);
      return userInfo;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
        
      } else if (error instanceof Error) {
        throw new AuthenticationError(`Authentication error: ${error.message}`);

      } else {
        throw new AuthenticationError(`Authentication error: ${error}`);
      }
    }
  }

  private async _createClient(): Promise<Client> {
    const idpUrl = APPLICATION_CONFIG().idp.url;
    const clientId = APPLICATION_CONFIG().idp.clientId;
    const userInfoSignedResponseAlg = APPLICATION_CONFIG().idp.userInfoSignedResponseAlg;

    try {
      logger.debug('Creating new OpenID connect client');
      const issuer = await Issuer.discover(idpUrl);
      const client = new issuer.Client({
        client_id: clientId,
        userinfo_signed_response_alg: userInfoSignedResponseAlg,
      });

      // Define custom options
      client[custom.http_options] = (options: HttpOptions) => {
        const timeout = APPLICATION_CONFIG().idp.timeoutMs || options.timeout;
        return { ...options, timeout: timeout }
      }

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
