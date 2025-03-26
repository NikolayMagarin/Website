import { Project } from './projects';

declare global {
  namespace Express {
    export interface Request {
      desmos: RequestDesmos;
    }

    export interface Response {
      desmos: ResponseDesmos;
    }
  }
}

export interface RequestDesmos {
  clientStorage: {
    get(key: string): string | undefined;
    has(key: string): boolean;
  };
  /**
   * Whether the request was made because of the first page load
   */
  pageLoad: boolean;
  user: {
    /**
     * `id` is `null` if `req.desmos.pageLoad` is `true`
     */
    id: string | null;
    /**
     * `sessionId` is `null` if `req.desmos.pageLoad` is `true`
     */
    sessionId: string | null;
    /**
     * Whether the user got new `id`
     */
    justRegistered: boolean;
    /**
     * Whether the user got new `sessionId`
     */
    newSession: boolean;
  };
  project: Project;
}

export interface ResponseDesmos {
  clientStorage: {
    /**
     * @param maxAge in seconds
     */
    set(key: string, value: string, maxAge?: number | 'session'): void;
  };
}
