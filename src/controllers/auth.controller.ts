import { Request, Response, NextFunction, RequestHandler } from 'express';

import {
  // mockSignupService,
  signupService,
  loginService,
  logoutService,
  getAuthProfileService,
  sendForgotPasswordMailService,
  refreshTokenService,
  removeAuthService,
  updateAuthService,
  resetPasswordService,
} from '../services';
import { AuthenticatedRequestBody, IUser } from '../interfaces';

export const signupController = (req: Request, res: Response, next: NextFunction) => signupService(req, res, next);

export const loginController = (req: Request, res: Response, next: NextFunction) => loginService(req, res, next);

export const getAuthProfileController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  getAuthProfileService(req, res, next);

export const logoutController = (req: Request, res: Response, next: NextFunction) => logoutService(req, res, next);



export const updateAuthController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  updateAuthService(req, res, next);

export const removeAuthController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  removeAuthService(req, res, next);

export const refreshTokenController: RequestHandler = async (req, res, next) => refreshTokenService(req, res, next);

export const sendForgotPasswordMailController: RequestHandler = async (req, res, next) =>
  sendForgotPasswordMailService(req, res, next);

export const resetPasswordController: RequestHandler = async (req, res, next) => resetPasswordService(req, res, next);
