import { logger } from "./logger";

export class AuthenticationError extends Error {

  constructor(message: string) {
    super(message);
    logger.error(message);
  }
}