import { AccountParameters } from "./account-parameter.model";
import { UserInfo } from "./user-info.model";

export interface IAttributeProvider {
  getUserId(userInfo: UserInfo): string | Promise<string>;
  getUsername(userInfo: UserInfo): string | Promise<string>;
  getFirstname(userInfo: UserInfo): string | Promise<string>;
  getLastname(userInfo: UserInfo): string | Promise<string>;
  getEmail(userInfo: UserInfo): string | Promise<string>;
  getAccountParameters(userInfo: UserInfo): AccountParameters | Promise<AccountParameters> ;
}

export class DefaultAttributeProvider implements IAttributeProvider {
 
  constructor() {
  }
  
  getUserId(userInfo: UserInfo): string {
    throw new Error("Method not implemented.");
  }

  getUsername(userInfo: UserInfo): string {
    return userInfo.get('preferred_username')
  }

  getFirstname(userInfo: UserInfo): string {
    return userInfo.get('given_name');
  }

  getLastname(userInfo: UserInfo): string {
    return userInfo.get('family_name');
  }

  getEmail(userInfo: UserInfo): string {
    return userInfo.get('email');
  }

  getAccountParameters(userInfo: UserInfo): AccountParameters {
    return {};
  }

}