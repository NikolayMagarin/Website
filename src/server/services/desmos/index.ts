import { Router } from 'express';
import { init as initMessengerProject } from './projects/messenger';

export const router = Router();

initMessengerProject(router);
