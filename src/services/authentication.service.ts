import { UserinfoResponse } from 'openid-client';
import { singleton } from 'tsyringe';
import { OpenIDDataSource } from '../datasources';
import { UserInfo } from '../models';
import { AuthenticationError } from '../utils';

@singleton()
export class AuthenticationService {

  constructor(private _openIdDataSource: OpenIDDataSource) {
  }

  async authenticate(accessToken: string): Promise<UserInfo> {

    let userinfoResponse: UserinfoResponse = null
    if (accessToken == null) {
      throw new AuthenticationError(`token is null`);

    } else {
      userinfoResponse = await this._openIdDataSource.authenticate(accessToken);
    }

    const userInfo = new UserInfo(userinfoResponse);

    return userInfo;
  }

}
