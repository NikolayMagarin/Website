import { RequestHandler } from 'express';
import path from 'path';
import { getUserByClientIp, storage } from './storage';

export const handleRefresh: RequestHandler = function (req, res) {
  if (req.desmos.pageLoad) {
    const clientIp = req.desmos.user.clientIp;
    if (clientIp) {
      let user = getUserByClientIp(clientIp);

      const sendAfterMove = () => {
        let savedSum = storage.global.game.data.reduce(
          (a, b) => a + b,
          0 as number
        );

        const interval = setInterval(() => {
          const curSum = storage.global.game.data.reduce(
            (a, b) => a + b,
            0 as number
          );

          if (savedSum !== curSum) {
            if (!user!.madeMove) {
              res
                .status(200)
                .type('image/svg+xml')
                .sendFile(path.resolve(__dirname, 'static', 'refresh.svg'));
              clearInterval(interval);
            } else {
              user!.madeMove = false;
              savedSum = curSum;
            }
          }

          if (user!.errorToDisplay) {
            res
              .status(200)
              .type('image/svg+xml')
              .sendFile(
                path.resolve(
                  __dirname,
                  'static',
                  `error-${user!.errorToDisplay}.svg`
                )
              );

            clearInterval(interval);
            user!.errorToDisplay = null;
            return;
          }
        }, 1000);

        res.on('close', () => {
          clearInterval(interval);
        });
      };

      if (user) {
        sendAfterMove();
      } else {
        setTimeout(() => {
          user = getUserByClientIp(clientIp);
          if (user) {
            sendAfterMove();
          } else {
            res.status(200).type('image/svg+xml').send('');
          }
        }, 1000);
      }
    } else {
      res.status(200).type('image/svg+xml').send('');
    }
  } else {
    res.status(200).type('image/svg+xml').send(`
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">
        <rect x="0" y="0" width="10" height="10"/>
      </svg>
    `);
  }
};
