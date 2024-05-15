import jwt, { VerifyErrors } from 'jsonwebtoken';
import { NextFunction, Response } from 'express';
import createHttpError, { InternalServerError } from 'http-errors';

import User from '../../models/User.model';
import { environmentConfig } from '../../configs/custom-environment-variables.config';
import { IAuthRequest, IUser } from '../../interfaces';
import { customResponse } from '../../utils';

export const isAuth = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const authHeader = (req && req.headers.authorization) || (req && req.headers.Authorization);
  const token = (authHeader && authHeader.split(' ')[1]) || req?.cookies?.authToken || req?.cookies?.accessToken || '';
  
  if (!token) {
    return res.status(401).json(
      customResponse<object>({
        data: {
          token:token,
          authHeader:authHeader
        },
        success: false,
        error: true,
        message: 'Auth Failed (Invalid Credentials)',
        status: 401,
      })
    );
    // return next(createHttpError(401, ));
  }

  jwt.verify(
    token,
    environmentConfig.ACCESS_TOKEN_SECRET_KEY as jwt.Secret,
    async (err: VerifyErrors | null, decodedUser: any) => {
      if (err) {
        // JsonWebTokenError or token has expired
        const errorMessage = err.name === 'JsonWebTokenError' ? 'Auth Failed (Unauthorized)' : err.message;
        return res.status(403).json(
          customResponse<object>({
            data: {
         
            },
            success: false,
            error: true,
            message: errorMessage,
            status: 403,
          })
        );
        // return next(createHttpError(403, errorMessage));
      }

      try {
        const decodedUserInDB = await User.findOne({ _id: decodedUser?.userId }).select('-password -confirmPassword');

        if (!decodedUserInDB) {
          // return next(createHttpError(403, `Auth Failed (Unauthorized)`));
          return res.status(403).json(
            customResponse<object>({
              data: {
         
              },
              success: false,
              error: true,
              message: 'Auth Failed (Unauthorized)',
              status: 403,
            })
          );
        }
        // console.log('The Authorized Admin is ', user);
        // req.user = user as IUser;
        req.user = decodedUserInDB as IUser;

        // if we did success go to the next middleware
        next();
      } catch (error :any) {
        return res.status(500).json(
          customResponse<object>({
            data: {
       
            },
            success: false,
            error: true,
            message: error.message,
            status: 500,
          }))
              }
    }
  );
};

export default { isAuth };
