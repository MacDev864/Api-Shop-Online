import { NextFunction, Response } from 'express';
import createHttpError from 'http-errors';

import { environmentConfig } from '../../configs/custom-environment-variables.config';
import { IAuthRequest as IAdminRequest } from '../../interfaces';
import { authorizationRoles } from '../../constants';
import { customResponse } from '../../utils';

export const isSuperadmin = async (req: IAdminRequest, res: Response, next: NextFunction) => {
  const user = req?.user;

  // const adminEmails = environmentConfig?.ADMIN_EMAILS && (JSON.parse(environmentConfig.ADMIN_EMAILS) as string[]);
  const adminUser = user && user.role === authorizationRoles.superadmin ;

  if (!adminUser) {
    return res.status(403).json(
      customResponse<object>({
        data: {
        },
        success: false,
        error: true,
        message: "Auth Failed (Unauthorized)",
        status: 403,
      })
    );
    // return next(createHttpError(403, ``));
  }

  next();
};
export const isAdmin = async (req: IAdminRequest, res: Response, next: NextFunction) => {
  const user = req?.user;

  // const adminEmails = environmentConfig?.ADMIN_EMAILS && (JSON.parse(environmentConfig.ADMIN_EMAILS) as string[]);
  const adminUser = user && user.role === authorizationRoles.admin ;

  if (!adminUser) {
    return res.status(403).json(
      customResponse<object>({
        data: {
        },
        success: false,
        error: true,
        message: "Auth Failed (Unauthorized)",
        status: 403,
      })
    );
    // return next(createHttpError(403, ``));
  }

  next();
};
export const checkRoleAdmin = async (req: IAdminRequest, res: Response, next: NextFunction) => {
  const user = req?.user;

  // const adminEmails = environmentConfig?.ADMIN_EMAILS && (JSON.parse(environmentConfig.ADMIN_EMAILS) as string[]);
  const adminUser = user && user.role === authorizationRoles.admin || user?.role === authorizationRoles.superadmin;

  if (!adminUser) {
    return res.status(403).json(
      customResponse<object>({
        data: {
        },
        success: false,
        error: true,
        message: "Auth Failed (Unauthorized)",
        status: 403,
      })
    );
    // return next(createHttpError(403, ``));
  }

  next();
};
export default { isAdmin ,isSuperadmin,checkRoleAdmin};
