import { RequestHandler } from 'express';
import { getUserByClientIp, storage } from './storage';

export const handleState: RequestHandler = function (req, res) {
  if (req.desmos.pageLoad) {
    const clientIp = req.desmos.user.clientIp;
    if (req.query['after-my-move'] && clientIp) {
      let user = getUserByClientIp(clientIp);

      const sendAfterMove = () => {
        user!.madeMove = false;
        const interval = setInterval(() => {
          req.logger.trace('WAIT', {
            madeMove: user!.madeMove,
            game: storage.global.game,
          });
          if (user!.madeMove) {
            req.logger.trace('SUCCESS');
            clearInterval(interval);
            res.status(200).type('image/svg+xml').send(getGameStateSVG());
          }
        }, 1000);

        res.on('close', () => {
          clearInterval(interval);
        });
      };

      if (user) {
        req.logger.trace('IMMEDIATELY');
        sendAfterMove();
      } else {
        const timeout = setTimeout(() => {
          user = getUserByClientIp(clientIp);
          if (user) {
            req.logger.trace('AFTER SECOND');
            sendAfterMove();
          } else {
            req.logger.trace('NO USER');
            res.status(200).type('image/svg+xml').send(getGameStateSVG());
          }
        }, 2500);

        res.on('close', () => {
          clearTimeout(timeout);
        });
      }
    } else {
      req.logger.trace('NO IP');
      res.status(200).type('image/svg+xml').send(getGameStateSVG());
    }
  } else {
    res.status(200).type('image/svg+xml').send(`
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">
        <rect x="0" y="0" width="10" height="10"/>
      </svg>
    `);
  }
};

function getGameStateSVG() {
  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .container {
          padding: 10px;
          position: absolute;
          bottom: 0px;

          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: 1fr 1fr 1fr;
          gap: 10px;

          width: 200px;
          height: 200px;

          box-sizing: border-box;
        }

        .background {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: black;
          border-radius: 10px;
        }

        .cell {
          width: 100%;
          height: 100%;
          background-color: #f7fbff;

          border-radius: 5px;
          padding: 2px;
          box-sizing: border-box;
          font-size: 0px;
        }
      </style>
      <foreignObject width="100%" height="100%">
        <div class="background" xmlns="http://www.w3.org/1999/xhtml"></div>
        <div class="container" xmlns="http://www.w3.org/1999/xhtml">
          ${storage.global.game.data
            .map((v) => {
              if (v === 0) {
                return `<div class="cell"></div>`;
              }

              if (v === 1) {
                return `<div class="cell">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="red" stroke-width="10"
                      stroke-linecap="round">
                      <line x1="13" y1="13" x2="87" y2="87" />
                      <line x1="87" y1="13" x2="13" y2="87" />
                    </svg>
                </div>`;
              }

              if (v === 2) {
                return `<div class="cell">
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="40" stroke="blue" stroke-width="10" fill="none" />
                  </svg>
                </div>`;
              }
            })
            .join('\n')}
        </div>
      </foreignObject>
    </svg>
  `;
}
