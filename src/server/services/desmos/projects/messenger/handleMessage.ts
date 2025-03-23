import { RequestHandler } from 'express';
import { PROJECT_ID } from '.';
import { logger } from '../../../../lib/logger';
import { decodeText } from './decodeText';
import { storage } from './storage';

export const handleMessage: RequestHandler = function (req, res) {
  if (req.desmos.pageLoad) {
    res.status(200).type('image/svg+xml').send(`
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">
        <rect x="0" y="0" width="10" height="10"/>
      </svg>
    `);
  } else {
    const userId = req.desmos.user.id!;

    if (!storage.users[userId]) {
      storage.users[userId] = {
        currentMessageTimings: [],
        endOfMessageTimeout: null,

        name: `user-${userId.slice(0, 5)}`,
      };
    }

    if (req.desmos.user.justRegistered) {
      logger.log('service-desmos', 'user-register', {
        projectId: PROJECT_ID,
        userId: userId,
      });
    }

    const user = storage.users[userId];
    user.currentMessageTimings.push(performance.now());

    if (user.endOfMessageTimeout !== null) {
      clearTimeout(user.endOfMessageTimeout);
      user.endOfMessageTimeout = null;
    } else {
      logger.log('service-desmos', 'message start', {
        projectId: PROJECT_ID,
        userId: userId,
      });
    }

    // Если данные не поступали уже 3 секунды, то считаем, что сообщение закончилось
    const WAIT_FOR_MESSAGE_END = 3000;
    user.endOfMessageTimeout = setTimeout(() => {
      user.endOfMessageTimeout = null;
      logger.log('service-desmos', 'message end', {
        projectId: PROJECT_ID,
        userId: userId,
      });

      const timings = user.currentMessageTimings;

      const delays: number[] = [];
      for (let i = 0; i < timings.length - 1; i++) {
        delays.push(timings[i + 1] - timings[i]);
      }

      const halfDelay = calculateHalfDelay(delays);

      let result = delays
        .map((d) => (d / halfDelay >= 1.5 ? 2 : 1))
        .concat([1])
        .reduce<[number, string]>(
          (acc, d) => {
            acc[0] = (acc[0] + d) % 2;
            acc[1] += acc[0] ? '' : `${2 - d}`;
            return acc;
          },
          [0, '']
        )[1];

      if (result.length % 8 === 0) {
        result += '0';
      }
      result = result.slice(1);

      logger.log('service-desmos', 'new message data', {
        projectId: PROJECT_ID,
        userId: userId,
        data: {
          payload: result,
          size: result.length,
          decodeFactorType:
            halfDelay === delays[1] - delays[0] ? 'first' : 'average',
        },
      });

      let text = decodeText(result);

      text = text
        .split('')
        .filter((char) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(char))
        .join('');

      if (text.length) {
        storage.global.chat.messages.push({ userName: user.name, text: text });
        if (storage.global.chat.messages.length > 20) {
          storage.global.chat.messages.shift();
        }

        logger.log('service-desmos', 'new message text', {
          projectId: PROJECT_ID,
          userId: userId,
          text: {
            payload: text,
            size: text.length,
          },
        });
      } else {
        logger.log('service-desmos', `user-login`, {
          projectId: PROJECT_ID,
          userId: userId,
        });
      }

      user.currentMessageTimings = [];
    }, WAIT_FOR_MESSAGE_END);

    res.status(200).send('');
  }
};

function calculateHalfDelay(delays: number[]): number {
  // caclulations in milliseconds

  const min = Math.min(...delays);
  for (let result = min / 2; result <= min; result++) {
    if (
      delays.every((d) => {
        const rounded = Math.round(d / result);
        return rounded === 1 || rounded === 2;
      })
    ) {
      return result;
    }
  }

  return delays[1] - delays[0];
}
