import { NextFunction, Request, Response } from 'express';

import { moderatorGetUsersService } from '../services/moderator.service';

export const moderatorGetUsersController = (req: Request, res: Response, next: NextFunction) =>
  moderatorGetUsersService(req, res, next);
