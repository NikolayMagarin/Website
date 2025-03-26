import { RequestHandler } from 'express';
import { getClientIp } from 'request-ip';
import { v4 as uuid } from 'uuid';

export function userAuthMiddleware(): RequestHandler {
  return (req, res, next) => {
    req.desmos.user.clientIp = getClientIp(req);
    if (req.desmos.pageLoad) {
      req.desmos.user.id = null;
      req.desmos.user.sessionId = null;
    } else {
      const userId = req.desmos.clientStorage.get('user_id');
      const sessionId = req.desmos.clientStorage.get('session_id');
      req.desmos.user.id = userId || uuid();
      req.desmos.user.sessionId = sessionId || uuid();

      req.desmos.user.justRegistered = !userId;
      req.desmos.user.newSession = !sessionId;

      if (!sessionId || !userId) {
        res.desmos.clientStorage.set('user_id', req.desmos.user.id, 2592000);
        res.desmos.clientStorage.set(
          'session_id',
          req.desmos.user.sessionId,
          'session'
        );
      }
    }

    next();
  };
}
