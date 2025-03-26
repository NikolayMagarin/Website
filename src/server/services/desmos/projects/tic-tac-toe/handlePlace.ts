import { RequestHandler } from 'express';
import { storage } from './storage';

export const handlePlace: RequestHandler = function (req, res) {
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
        id: userId,
        name: `user-${userId.slice(0, 5)}`,
        clientIp: req.desmos.user.clientIp,
        requestAccumulator: 0,
        endOfMessageTimeout: null,
        errorToDisplay: null,
        madeMove: false,
      };
    }

    if (req.desmos.user.justRegistered) {
      req.logger.info('User registered', {
        projectId: req.desmos.project.id,
        userId: userId,
      });
    }
    const user = storage.users[userId];
    user.requestAccumulator++;

    user.errorToDisplay = null;

    if (user.endOfMessageTimeout !== null) {
      clearTimeout(user.endOfMessageTimeout);
      user.endOfMessageTimeout = null;
    } else {
      req.logger.trace('Message start');
    }

    const WAIT_FOR_MESSAGE_END = 1500;
    user.endOfMessageTimeout = setTimeout(() => {
      user.endOfMessageTimeout = null;
      req.logger.trace('Message end');

      const messageValue = user.requestAccumulator;
      user.requestAccumulator = 0;

      if (messageValue === 1) {
        req.logger.info('User logined', {
          projectId: req.desmos.project.id,
          userId: userId,
        });
        return;
      }

      req.logger.info('Message recieved', {
        projectId: req.desmos.project.id,
        userId: userId,
        data: {
          message: messageValue,
        },
      });

      const cellId = messageValue - 2;
      if (storage.global.game.lastMovedUserId === user.id) {
        req.logger.info('User tried place two times in a row', {
          projectId: req.desmos.project.id,
          userId: userId,
          data: { cellId: cellId },
        });

        user.errorToDisplay = 'secondmove';
      } else if (storage.global.game.data[cellId] !== 0) {
        req.logger.info('User tried to occupy already occupied cell', {
          projectId: req.desmos.project.id,
          userId: userId,
          data: { cellId: cellId },
        });

        user.errorToDisplay = 'occupied';
      } else {
        storage.global.game.data[cellId] = storage.global.game.curMove;
        storage.global.game.curMove = storage.global.game.curMove === 1 ? 2 : 1;
        user.madeMove = true;
        storage.global.game.lastMovedUserId = user.id;
      }
    }, WAIT_FOR_MESSAGE_END);

    res.status(200).send('');
  }
};
