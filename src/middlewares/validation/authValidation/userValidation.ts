import { RequestHandler } from 'express';
import validator from '../validator';
import { userSchema } from './userSchema';

export const signupUserValidation: RequestHandler = (req, res, next) =>
  validator(userSchema.signupUser, { ...req.file, ...req.body }, next);

export const loginUserValidation: RequestHandler = (req, res, next) => validator(userSchema.loginUser, req.body, next);

export const updateUserValidation: RequestHandler = (req, res, next) =>
  validator(userSchema.updateUser, { ...req.file, ...req.body, ...req.params }, next);



export const refreshTokenValidation: RequestHandler = (req, res, next) =>
  validator(userSchema.refreshToken, req.body, next);



export const resetPasswordValidation: RequestHandler = (req, res, next) =>
  validator(userSchema.resetPassword, { ...req.body, ...req.params }, next);

export const userIdValidation: RequestHandler = (req, res, next) => {
  return validator(userSchema.validatedUserId, req.params, next);
};
