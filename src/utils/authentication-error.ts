import { logger } from "./logger";

export class AuthenticationError {

  constructor(public message: string) {
    logger.error(message);
  }
}