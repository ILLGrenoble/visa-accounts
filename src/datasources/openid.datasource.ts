import { APPLICATION_CONFIG } from '../application-config';
import { Client, Issuer, UserinfoResponse } from 'openid-client';
import { AuthenticationError, logger } from '../utils';
import { verify, decode } from 'jsonwebtoken';
import JwksRsa, { JwksClient } from 'jwks-rsa';

export class OpenIDDataSource  {
  static dataSourceName = 'open-id';

  private _issuer: Issuer<Client>;
  private _client: Client;
  private _clientPromise: Promise<Client>;

  private _signingKey: string;
 
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

      const jwt = verify(token, this._signingKey, {
        issuer: this._issuer.issuer as string,
        complete: true
      });

      // Check if client_id is passed in the token and confirm it matches what we expect
      if (jwt.payload['azp'] && jwt.payload['azp'] !== APPLICATION_CONFIG().idp.clientId) {
        throw new AuthenticationError('Token does not correspond to the client');
      }

      // const client = await this.client;
      // const userInfo = await client.userinfo(token);
      
      const userInfo = jwt.payload as UserinfoResponse;
      return userInfo;
   
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
        
      } else if (error instanceof Error) {
        throw new AuthenticationError(`${error.message}`);

      } else {
        throw new AuthenticationError(`${error}`);
      }
    }
  }

  private async _createClient(): Promise<Client> {
    const idpUrl = APPLICATION_CONFIG().idp.url;
    const clientId = APPLICATION_CONFIG().idp.clientId;

    try {
      logger.debug('Creating new OpenID Connect client');
      this._issuer = await Issuer.discover(idpUrl);
      const client = new this._issuer.Client({
        client_id: clientId,
        // userinfo_signed_response_alg: 'RS256',
      });


      logger.debug('Obtaining signing key from OpenID Connect provider');
      this._signingKey = await this.getSigningKey();

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

  getSigningKey(): Promise<string> {
    const metadata = this._issuer.metadata;
    const jwksUri = metadata.jwks_uri;

    return new Promise((resolve, reject) => {
      const jwksClient = new JwksRsa.JwksClient({
        jwksUri: jwksUri
      });

      jwksClient.getSigningKey(null, function(error, key: any) {
        const signingKey = key.publicKey || key.rsaPublicKey;

        if (error) {
          logger.error(`Failed to get signing key from JWKS endpoint of the OpenID Connect provider ${jwksUri} : ${error.message}`);
          reject(error);

        } else {
          resolve(signingKey);
        }
      });
    });
  }

}
