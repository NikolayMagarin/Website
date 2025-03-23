import { RequestHandler } from 'express';
import { config } from '../config';
import { db } from './db';

interface Logger {
  handler: RequestHandler;
  log: (group: string, message: string, data?: Data, options?: Options) => void;
}

type Data = Record<string, any>;

interface Options {
  logData?: boolean;
}

const validUserAnalyticsMessages = new Set(['rickrolled-counter']);

export const logger: Logger = {
  handler: (req, res) => {
    if (
      typeof req.body.message === 'string' &&
      validUserAnalyticsMessages.has(req.body.message)
    ) {
      logger.log('user-analytics', req.body.message, {
        ...(req.body.data ? req.body.data : {}),
      });
    }

    res.status(200).json({ ok: true });
  },

  log(group, message, data, options) {
    if (options?.logData) {
      console.log(`[${group}] ${message}`, data);
    } else {
      console.log(`[${group}] ${message}`);
    }

    if (config.environment === 'prod') {
      const date = new Date();
      db.collection('logs')
        .doc(date.toLocaleDateString('ru'))
        .collection('logs')
        .add({
          time: date.toLocaleTimeString(),
          group,
          message,
          ...(data ? { data } : {}),
        });
    }
  },
};
