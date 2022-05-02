import "reflect-metadata";
import { logger } from './utils';
import express from 'express'
import * as http from 'http';
import { AuthenticationController } from "./controllers";
import { OpenIDDataSource } from './datasources';
import { container } from "tsyringe";
import { APPLICATION_CONFIG } from "./application-config";

export class Application {

  private _server: http.Server;
  private _datasource: OpenIDDataSource = new OpenIDDataSource();

  constructor() {
    this._init();
  }

  async start(): Promise<null> {
    if (!this._server) {
      // Start the application
      logger.info('Starting application');

      const app = express();
      app.use(express.json());

      await this._datasource.start();

      app.get('/api/authenticate', (req, res) => container.resolve(AuthenticationController).authenticate(req, res));

      const port = APPLICATION_CONFIG().server.port;
      const host = APPLICATION_CONFIG().server.host;
      this._server = app.listen(port);

      logger.info(`Application started (listening on ${host}:${port})`);
    }

    return null;
  }

  async stop(): Promise<null> {
    if (this._server) {
      logger.info('Stopping http server...');
      this._server.close();

      logger.info('... http server stopped');
      this._server = null;
    }

    return null;
  }

  private _init() {
    container.register<OpenIDDataSource>(OpenIDDataSource, {
      useValue: this._datasource
    });
  }
}
