import { Request, Response } from 'express-serve-static-core';
import { singleton } from 'tsyringe';
import { AccountToken, User } from '../models';
import { AttributeService, AuthenticationService } from '../services';
import { AuthenticationError, logger } from '../utils';

@singleton()
export class AuthenticationController {
  constructor(
      private _authenticationService: AuthenticationService,
     private _attributeService: AttributeService) {
  }

  async authenticate(req: Request, res: Response): Promise<AccountToken> {
    try {
      const accessToken: string = req.headers['access_token'] as string;
      if (!accessToken) {
        logger.info(`access_token has not been sent to authenticate`);
        res.status(401).send(`Unauthorized`);
        return;
      }

      // Authentication 
      const userInfo = await this._authenticationService.authenticate(accessToken);

      const accountParameters = this._attributeService.getAccountParameters(userInfo);

      // Construct user from attributes
      const user = new User({
        id: this._attributeService.getUserId(userInfo),
        email: this._attributeService.getEmail(userInfo),
        firstName: this._attributeService.getFirstname(userInfo),
        lastName: this._attributeService.getLastname(userInfo)
      });

      const username = this._attributeService.getUsername(userInfo);

      logger.info(`Successfully authenticated user: ${username} (${user.id})`);
      if (user.id === "") {
          logger.error(`User ${user.fullName} with login ${username} has an invalid user id (empty string)`);
      }

      const accountToken = new AccountToken({
        user: user,
        username: username,
        accountParameters: accountParameters
      });
 
      res.status(200).json(accountToken);

    } catch (error) {
      if (error instanceof AuthenticationError) {
        logger.info(`Authentication error occurred: ${error.message}`);
        res.status(401).send(error.message);
        
      } else {
        logger.error(`Internal server error occurred during authentication.`);
        console.log(error.stack);
        res.status(500).send(`Server error: ${error.message}`);
}
    }
  }
  
}
