import { Response, NextFunction } from 'express';

import { followUserService, unFollowUserService } from '../services';
import { AuthenticatedRequestBody, IUser } from '../interfaces';

export const followUserController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  followUserService(req, res, next);

export const unFollowUserController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  unFollowUserService(req, res, next);
