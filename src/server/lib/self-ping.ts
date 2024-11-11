import { RequestHandler } from 'express';
import { config } from '../config';

const requiresSelfPing = config.environment === 'prod';

export const useSelfPingSecret: RequestHandler = (req, res, next) => {
  if (req.body?.selfPingSecret === config.selfPingSecret) {
    next();
  } else {
    res.status(403).json({ ok: false, error: 'Not allowed' });
  }
};

export const selfPingHandler: RequestHandler = (req, res) => {
  if (requiresSelfPing) {
    console.log('ping');
    setTimeout(ping, config.selfPingInterval);
  }
  res.json({ ok: true, status: 'alive' });
};

function ping() {
  fetch(config.selfUrl + '/api/self-ping', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      selfPingSecret: config.selfPingSecret,
    }),
  }).catch();
}

if (requiresSelfPing) {
  ping();
}
