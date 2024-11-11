import { RequestHandler } from 'express';
import { db } from './db';

interface Logger {
  handler: RequestHandler;
  log: (group: string, message: string, data?: Record<string, any>) => void;
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
        ip: req.ip,
      });
    }

    res.status(200).json({ ok: true });
  },

  log(group, message, data) {
    console.log(`[${group}] ${message}`);

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
  },
};
