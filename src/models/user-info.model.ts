import { UserinfoResponse } from 'openid-client';

export class UserInfo {
  constructor(private _userinfoResponse: UserinfoResponse) {
  }

  get(attribute: string): any {
    return this._userinfoResponse[attribute];
  }

}
