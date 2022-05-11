import { Request, Response } from 'express-serve-static-core';
import { singleton } from 'tsyringe';
import { AccountToken, User } from '../models';
import { AttributeService, AuthenticationService } from '../services';
import { AuthenticationError, logger } from '../utils';

@singleton()
export class AuthenticationController {

  private _requestId: number = 0;

  constructor(
    private _authenticationService: AuthenticationService,
    private _attributeService: AttributeService) {
  }

  async authenticate(req: Request, res: Response): Promise<AccountToken> {
    const requestId = ++this._requestId;

    try {
      const accessToken: string = req.headers['x-access-token'] as string;
      if (!accessToken) {
        logger.info(`access_token has not been sent to authenticate`);
        res.status(401).send(`Unauthorized`);
        return;
      }

      // Authentication
      logger.debug(`[${requestId}] Starting authentication request`);

      const userInfo = await this._authenticationService.authenticate(accessToken);

      const accountAttributes = await this._attributeService.getAccountAttributes(userInfo);

      // Construct user from attributes
      const user = new User({
        id: accountAttributes.userId,
        email: accountAttributes.email,
        firstName: accountAttributes.firstName,
        lastName: accountAttributes.lastName
      });

      const username = accountAttributes.username;
      const accountParameters = accountAttributes.accountParameters;

      logger.info(`[${requestId}] Successfully authenticated user: ${username} (${user.id})`);
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
        logger.error(`[${requestId}] Authentication error occurred: ${error.message}`);
        res.status(401).send(error.message);
        
      } else if (error instanceof Error) {
        logger.error(`[${requestId}] Internal server error occurred during authentication.`);
        console.log(error.stack);
        res.status(500).send(`Server error: ${error.message}`);
      
      } else {
        logger.error(`[${requestId}] Unknown server error occurred during authentication.`);
        console.log(error);
        res.status(500).send(`Server error: ${error}`);
      }
    }
  }
  
}
