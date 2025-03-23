import { RequestHandler } from 'express';
import { parse as parseCookie, serialize as serializeCookie } from 'cookie';

export function clientStorageMiddleware(projectId: string): RequestHandler {
  const cookiePrefix = `dgp_${projectId}_`;

  return (req, res, next) => {
    const reqCookie = req.get('Cookie');
    const cookies = reqCookie ? parseCookie(reqCookie) : null;
    const map = new Map<string, string | undefined>();
    if (cookies) {
      for (const key in cookies) {
        if (key.startsWith(cookiePrefix)) {
          map.set(key.slice(cookiePrefix.length), cookies[key]);
        }
      }
    }

    req.desmos.clientStorage = {
      get(key) {
        return map.get(key);
      },
      has(key) {
        return map.has(key);
      },
    };

    res.desmos.clientStorage = {
      set(key, value, maxAge: 'session' | number = 2592000) {
        const data = serializeCookie(cookiePrefix + key, value, {
          sameSite: 'none',
          secure: true,
          maxAge: maxAge === 'session' ? undefined : maxAge,
        });

        res.append('Set-Cookie', data);
      },
    };

    next();
  };
}
