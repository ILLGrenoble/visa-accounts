import { config, createLogger, format, transports } from 'winston';
import { Syslog } from 'winston-syslog';
import { APPLICATION_CONFIG } from '../application-config';
import moment from 'moment-timezone';

export const buildLogger = function() {
  const appendTimestamp = format((info, opts) => {
    if (opts && opts.tz) {
      info.timestamp = moment().tz(opts.tz).format('YYYY-MM-DD HH:mm:ss');

    } else {
      info.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    }
    return info;
  });

  const logger = createLogger({
    levels: config.syslog.levels,
    level: APPLICATION_CONFIG().logging.level,
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          appendTimestamp(APPLICATION_CONFIG().logging.timezone ? {tz: APPLICATION_CONFIG().logging.timezone} : null),
          format.printf(info => {
            return `${info.timestamp} ${info.level}: ${info.message}`;
          })
        )
      })
    ]
  });

  const syslogConf = APPLICATION_CONFIG().logging.syslog

  if (syslogConf.host && syslogConf.port && syslogConf.appName) {
    logger.add(new Syslog({
      host: syslogConf.host,
      port: syslogConf.port,
      format: format.combine(
        appendTimestamp(APPLICATION_CONFIG().logging.timezone ? {tz: APPLICATION_CONFIG().logging.timezone} : null),
        format.printf(info => {
          return `${info.timestamp} ${info.level}: ${info.message}`;
        })
      ),
      protocol: 'udp4',
      app_name: syslogConf.appName
    }));
    logger.info(`Using syslog logging transport (${syslogConf.host}:${syslogConf.port}) for program (${syslogConf.appName})`);
  }

  return logger;
};

export const logger = buildLogger();
