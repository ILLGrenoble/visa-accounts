import { DefaultAttributeProvider, IAttributeProvider, UserInfo } from '../models';
import { APPLICATION_CONFIG } from '../application-config';
import { logger } from '../utils';
import { AccountParameters } from '../models/account-parameter.model';
import { singleton } from 'tsyringe';

export interface AccountAttributes {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  accountParameters: AccountParameters;
}

@singleton()
export class AttributeService implements IAttributeProvider {

  private _attributeProvider: IAttributeProvider;

  constructor() {
    this._attributeProvider = new DefaultAttributeProvider();

    this._init();
  }

  async getAccountAttributes(userInfo: UserInfo): Promise<AccountAttributes> {
    const [userId, username, firstName, lastName, email, accountParameters] = await Promise.all([
      this.getUserId(userInfo), 
      this.getUsername(userInfo), 
      this.getFirstname(userInfo), 
      this.getLastname(userInfo), 
      this.getEmail(userInfo), 
      this.getAccountParameters(userInfo)
    ])

    return {userId, username, firstName, lastName, email, accountParameters} as AccountAttributes;
  }
  
  getUserId(userInfo: UserInfo): Promise<string> {
    return this._getGenericAttribute<string>(userInfo, this._attributeProvider.getUserId.bind(this._attributeProvider));
  }

  getUsername(userInfo: UserInfo): Promise<string> {
    return this._getGenericAttribute<string>(userInfo, this._attributeProvider.getUsername.bind(this._attributeProvider));
  }

  getFirstname(userInfo: UserInfo): Promise<string> {
    return this._getGenericAttribute<string>(userInfo, this._attributeProvider.getFirstname.bind(this._attributeProvider));
  }

  getLastname(userInfo: UserInfo): Promise<string> {
    return this._getGenericAttribute<string>(userInfo, this._attributeProvider.getLastname.bind(this._attributeProvider));
  }

  getEmail(userInfo: UserInfo): Promise<string> {
    return this._getGenericAttribute<string>(userInfo, this._attributeProvider.getEmail.bind(this._attributeProvider));
  }

  getAccountParameters(userInfo: UserInfo): Promise<AccountParameters> {
    return this._getGenericAttribute<AccountParameters>(userInfo, this._attributeProvider.getAccountParameters.bind(this._attributeProvider));
  }

  private _getGenericAttribute<T>(userInfo: UserInfo, attributeFunc: (userInfo: UserInfo) => T | Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const valueOrPromise = attributeFunc(userInfo);
      if (valueOrPromise && valueOrPromise instanceof Promise) {
        valueOrPromise.then(resolve).catch(reject);
  
      } else {
        resolve(valueOrPromise);
      }
    });
  }

  private _init(): void {
    const attributeProviderPath = APPLICATION_CONFIG().attributeProviderPath;

    const customAttributeProvider = this._loadProvider(attributeProviderPath);
    if (customAttributeProvider == null) {
      process.exit();
    
    } else {
      logger.info(`Loaded account attribute provider from path '${attributeProviderPath}'`);
      // Override functions of default attribute provider
      Object.keys(customAttributeProvider)
        .filter(key => typeof customAttributeProvider[key] === 'function')
        .forEach(key => {
          logger.info(`Overriding ${key} method of attribute provider`);
          this._attributeProvider[key] = customAttributeProvider[key];
        });

    }
  }

  private _loadProvider(attributeProviderPath: string): IAttributeProvider {
    logger.info(`Loading attribute provider with the file path '${attributeProviderPath}'`);
    if (attributeProviderPath != null) {
      try {
        let fullPath = attributeProviderPath;
        if (!attributeProviderPath.startsWith('/')) {
          fullPath = `../../${attributeProviderPath}`;
        }

        const attributeProvider = require(fullPath) as IAttributeProvider;
        if (this._validateProvider(attributeProvider)) {
          return attributeProvider;
        }

      } catch (error) {
        logger.error(`Could not load attribute provider with the file path '${attributeProviderPath}'`);
      }
    }

    return null;
  }

  private _validateProvider(attributeProvider: IAttributeProvider) {
    if (!attributeProvider) {
      logger.error('The attribute provider path has not been specified');
      return false
    
    } else if (!attributeProvider.getUserId) {
      logger.error('Incomplete IAttributeProvider interface: missing getUserId method');
      return false;

    } else {
      return true;
    }
  }

}
