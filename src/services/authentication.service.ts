import { singleton } from 'tsyringe';
import { APPLICATION_CONFIG } from '../application-config';
import { OpenIDDataSource } from '../datasources';
import { UserInfo } from '../models';
import { AuthenticationError, logger } from '../utils';
import { AuthenticationCache } from '../utils/authentication-cache';

@singleton()
export class AuthenticationService {

  private _authenticationCache = new AuthenticationCache(APPLICATION_CONFIG().idp.cacheExpirationS);

  constructor(private _openIdDataSource: OpenIDDataSource) {
  }

  async authenticate(requestId: number, accessToken: string): Promise<UserInfo> {

    if (accessToken == null) {
      throw new AuthenticationError(`token is null`);
    }

    // Try getting authentication from the cache
    if (this._authenticationCache.enabled) {
      const cacheEntry = this._authenticationCache.getAuthentication(accessToken);
      if (cacheEntry && !cacheEntry.isExpired()) {
        logger.debug(`[${requestId}] Obtaining authentication from cache`);
        return cacheEntry.getUserInfo();
      }
    }

    // Obtain a new authentication with the IDP
    try {
      logger.debug(`[${requestId}] Obtaining authentication from IDP`);
      const userinfoResponse = await this._openIdDataSource.authenticate(accessToken);
      const userInfo = new UserInfo(userinfoResponse);
  
      if (this._authenticationCache.enabled) {
        this._authenticationCache.addValidAuthentication(accessToken, userInfo);
      }
  
      return userInfo;
  
    } catch (error) {
      // Do not create a cache entry as the error could be transient (timeout for example)
      // if (this._authenticationCache.enabled) {
      //   this._authenticationCache.addInvalidAuthentication(accessToken, error);
      // }
      throw error;
    }
  }

}
