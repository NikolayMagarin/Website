import { Express } from 'express';
import { router as getMyIpImgRouter } from './get-my-ip-img';
import { router as desmosApiRouter } from './desmos';

const routers = {
  'get-my-ip-img': getMyIpImgRouter,
  desmos: desmosApiRouter,
} as const;

type RouterPath = keyof typeof routers;

export function enableServices(
  app: Express,
  routersToEnable: RouterPath[] | boolean = true
) {
  if (typeof routersToEnable === 'boolean') {
    if (routersToEnable) {
      for (const path in routers) {
        app.use(`/service/${path}`, routers[path as RouterPath]);
      }
    }
  } else {
    routersToEnable.forEach((path) => {
      app.use(path, routers[path]);
    });
  }
}
