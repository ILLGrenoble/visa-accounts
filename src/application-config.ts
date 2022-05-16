export class ApplicationConfig {
  server: {
    port: number,
    host: string
  }

  logging: {
    level: string;
    timezone: string;
    syslog: {
      host: string,
      port: number,
      appName: string,
    }
  };

  idp: {
    url: string;
    clientId: string;
    userInfoSignedResponseAlg: string;
    timeoutMs: number;
  };

  attributeProviderPath: string;

  constructor(data?: Partial<ApplicationConfig>) {
    Object.assign(this, data);
  }
}

let applicationConfig: ApplicationConfig;

export function APPLICATION_CONFIG(): ApplicationConfig {
  if (applicationConfig == null) {
    applicationConfig = {
      server: {
        port: process.env.VISA_ACCOUNTS_SERVER_PORT == null ? 4000 : +process.env.VISA_ACCOUNTS_SERVER_PORT,
        host: process.env.VISA_ACCOUNTS_SERVER_HOST == null ? 'localhost' : process.env.VISA_ACCOUNTS_SERVER_HOST
      },
      logging: {
        level: process.env.VISA_ACCOUNTS_LOG_LEVEL == null ? 'info' : process.env.VISA_ACCOUNTS_LOG_LEVEL,
        timezone: process.env.VISA_ACCOUNTS_LOG_TIMEZONE,
        syslog: {
          host: process.env.VISA_ACCOUNTS_LOG_SYSLOG_HOST,
          port: process.env.VISA_ACCOUNTS_LOG_SYSLOG_PORT == null ? null : +process.env.VISA_ACCOUNTS_LOG_SYSLOG_PORT,
          appName: process.env.VISA_ACCOUNTS_LOG_SYSLOG_APP_NAME
        }
      },
      idp: {
        url: process.env.VISA_ACCOUNTS_IDP,
        clientId: process.env.VISA_ACCOUNTS_CLIENT_ID,
        userInfoSignedResponseAlg: process.env.VISA_ACCOUNTS_IDP_USERINFO_SIGNED_RESPONSE_ALG == null ? null : process.env.VISA_ACCOUNTS_IDP_USERINFO_SIGNED_RESPONSE_ALG,
        timeoutMs: process.env.VISA_ACCOUNTS_IDP_TIMEOUT_MS == null ? null : +process.env.VISA_ACCOUNTS_IDP_TIMEOUT_MS,
      },
      attributeProviderPath: process.env.VISA_ACCOUNTS_ATTRIBUTE_PROVIDER
    };
  }

  return applicationConfig;
}
