import { type Router } from 'express';
import path from 'path';
import { Logger } from '../../../../lib/Logger';
import { createProject } from '../../lib/projects';
import { handleMessage } from './handleMessage';
import { refreshOnMessage } from './refreshOnMessage';
import { sendChat } from './sendChat';

// id проекта, для которого предназначено данное api. Не должен никогда меняться, ведь на его основе определяется имя кукиса авторизации
const PROJECT_ID = 'o2fpa83gw';
export function init(rootRouter: Router) {
  const project = createProject(PROJECT_ID, rootRouter);

  const middlewares = [
    project.middlewares.initDesmos,
    project.middlewares.clientStorage,
    project.middlewares.userAuth,
  ];

  project.router.use(
    new Logger({
      transforms: [
        (log) => ({ ...log, message: `[desmos:${PROJECT_ID}] ${log.message}` }),
      ],
    }).middleware(),
    project.middlewares.allowDesmosCors
  );

  project.router.get('/message', ...middlewares, handleMessage);

  project.router.get('/get-chat/', sendChat);

  project.router.get('/refresh', ...middlewares, refreshOnMessage);

  project.router.get('/static/:filename', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'static', req.params.filename));
  });
}
