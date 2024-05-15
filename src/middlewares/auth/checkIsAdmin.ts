import { NextFunction, Response } from 'express';
import createHttpError from 'http-errors';

import { environmentConfig } from '../../configs/custom-environment-variables.config';
import { IAuthRequest as IAdminRequest } from '../../interfaces';
import { authorizationRoles } from '../../constants';

export const isAdmin = async (req: IAdminRequest, res: Response, next: NextFunction) => {
  const user = req?.user;

  // const adminEmails = environmentConfig?.ADMIN_EMAILS && (JSON.parse(environmentConfig.ADMIN_EMAILS) as string[]);
  const adminUser = user && user.role === authorizationRoles.admin ;

  if (!adminUser) {
    return next(createHttpError(403, `Auth Failed (Unauthorized)`));
  }

  next();
};

export default { isAdmin };
