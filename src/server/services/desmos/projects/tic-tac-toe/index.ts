import { type Router } from 'express';
import path from 'path';
import { createProject } from '../../lib/projects';
import { handleState } from './handleState';
import { handlePlace } from './handlePlace';
import { handleRefresh } from './handleRefresh';

const PROJECT_ID = 't1njzut16';
export function init(rootRouter: Router) {
  const project = createProject(PROJECT_ID, rootRouter);

  const middlewares = [
    project.middlewares.initDesmos,
    project.middlewares.clientStorage,
    project.middlewares.userAuth,
  ];

  project.router.use(
    project.middlewares.logger,
    project.middlewares.allowDesmosCors
  );

  project.router.get('/place', ...middlewares, handlePlace);

  project.router.get('/gamestate', ...middlewares, handleState);

  project.router.get('/refresh', ...middlewares, handleRefresh);

  project.router.get('/static/:filename', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'static', req.params.filename));
  });
}
