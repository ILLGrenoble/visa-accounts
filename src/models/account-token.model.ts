import { AccountParameters } from "./account-parameter.model";
import { User } from "./user.model";

export class AccountToken {
  username: string;

  user: User;

  accountParameters: AccountParameters;

  constructor(data?: Partial<AccountToken>) {
    Object.assign(this, data);
  }
}