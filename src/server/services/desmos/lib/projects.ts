import { type RequestHandler, Router } from 'express';
import { Logger } from '../../../lib/Logger';
import { clientStorageMiddleware } from './clientStorage';
import { userAuthMiddleware } from './userAuth';

export interface Project {
  id: string;
  router: Router;
  middlewares: Record<
    'allowDesmosCors' | 'initDesmos' | 'clientStorage' | 'userAuth',
    RequestHandler
  >;
}

/**
 * Create new desmos api project
 * @param id Unique identifier of your project. All project data will asociate with it
 */
export function createProject(id: string, rootRouter: Router): Project {
  const router = Router();
  const project: Project = {
    id,
    router,
    middlewares: {} as Project['middlewares'],
  };

  project.middlewares.allowDesmosCors = (req, res, next) => {
    res.set('Access-Control-Allow-Origin', 'https://www.desmos.com');
    next();
  };

  project.middlewares.initDesmos = (req, res, next) => {
    req.desmos = {
      project,
      clientStorage: undefined,
      pageLoad: undefined,
      firstRequest: undefined,
      user: { id: undefined, sessionId: undefined },
    } as any;
    res.desmos = { clientStorage: undefined } as any;

    req.desmos.pageLoad = req.get('Origin') === 'https://www.desmos.com';
    req.desmos.project = project;

    next();
  };

  project.middlewares.clientStorage = clientStorageMiddleware(id);
  project.middlewares.userAuth = userAuthMiddleware();

  rootRouter.use(`/project/${id}`, router);

  return project;
}
