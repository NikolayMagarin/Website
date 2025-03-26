import { RequestHandler } from 'express';
import { config } from '../config';
import { db } from './db';
import { firestore } from 'firebase-admin';

const getTimestamp = firestore.FieldValue.serverTimestamp;

export enum LogLevel {
  'TRACE',
  'DEBUG',
  'INFO',
  'WARN',
  'ERROR',
  'FATAL',
}

export interface LogContext {
  params?: Record<string, any>;
  result?: Record<string, any>;
  error?: any;
  [key: string]: any;
}

export type LogTimestamp = ReturnType<typeof getTimestamp>;

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: LogTimestamp;
  context?: LogContext;
}

export interface LogOptions {
  [k: string]: never;
}

export type LogTransform = (entry: LogEntry) => LogEntry;

export interface LoggerConfig {
  environment?: 'dev' | 'prod';
  transforms?: LogTransform[];
}

declare global {
  namespace Express {
    export interface Request {
      logger: Logger;
    }
  }
}

export class Logger {
  private transforms: LogTransform[];
  private environment: 'dev' | 'prod';

  constructor(loggerConfig?: LoggerConfig) {
    this.environment = loggerConfig?.environment || config.environment;
    this.transforms = loggerConfig?.transforms || [];
  }

  static from(loggerBase: Logger, loggerConfig?: LoggerConfig) {
    return new Logger({
      environment: loggerConfig?.environment || loggerBase.environment,
      transforms: loggerConfig?.transforms
        ? loggerBase.transforms.concat(loggerConfig.transforms)
        : loggerBase.transforms,
    });
  }

  static middleware(loggerConfig?: LoggerConfig | Logger): RequestHandler {
    const logger =
      loggerConfig instanceof Logger ? loggerConfig : new Logger(loggerConfig);
    return (req, res, next) => {
      req.logger = logger;
      next();
    };
  }

  middleware(): RequestHandler {
    return (req, res, next) => {
      req.logger = this;
      next();
    };
  }

  log<T extends LogContext>(
    level: LogLevel,
    message: string,
    context?: T,
    options?: LogOptions
  ) {
    const entry = this.transforms.reduce((e, transform) => transform(e), {
      level: level,
      message: message,
      timestamp: getTimestamp(),
      context: context || {},
    } as LogEntry);

    if (this.environment === 'dev') {
      console.log(`[${LogLevel[level]}]`, entry.message, entry.context);
    }

    if (
      this.environment === 'prod' &&
      level !== LogLevel.TRACE &&
      level !== LogLevel.DEBUG
    ) {
      writeLogToDB(entry);
    }
  }

  trace(message: string, context?: LogContext, options?: LogOptions) {
    this.log(LogLevel.TRACE, message, context, options);
  }

  debug(message: string, context?: LogContext, options?: LogOptions) {
    this.log(LogLevel.DEBUG, message, context, options);
  }

  info(message: string, context?: LogContext, options?: LogOptions) {
    this.log(LogLevel.INFO, message, context, options);
  }

  warn(message: string, context?: LogContext, options?: LogOptions) {
    this.log(LogLevel.WARN, message, context, options);
  }

  error(message: string, context?: LogContext, options?: LogOptions) {
    this.log(LogLevel.ERROR, message, context, options);
  }

  fatal(message: string, context?: LogContext, options?: LogOptions) {
    this.log(LogLevel.FATAL, message, context, options);
  }
}

async function writeLogToDB(entry: LogEntry) {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const logEntryRef = db
      .collection(`logs/${year}/months/${month}/days/${day}/entries`)
      .doc();

    await logEntryRef.set(entry);
  } catch (error) {
    console.error('Error writing log to firestore: ', error);
  }
}
