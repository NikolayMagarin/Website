import { Router } from 'express';
import { init as initMessengerProject } from './projects/messenger';
import { init as initTicTacToeProject } from './projects/tic-tac-toe';

export const router = Router();

initMessengerProject(router);
initTicTacToeProject(router);
