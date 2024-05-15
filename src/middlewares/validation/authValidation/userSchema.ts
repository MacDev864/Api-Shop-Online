import Joi from 'joi';
// @ts-ignore
import JoiObjectId from 'joi-objectid';
import { authorizationRoles } from '../../../constants';

const vaildObjectId = JoiObjectId(Joi);

export const userSchema = {
  signupUser: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')),
    role: Joi.string(),
    isDeleted: Joi.boolean(),
    status: Joi.string(),
  }),
  loginUser: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
  }),
  updateUser: Joi.object({
    userId: vaildObjectId().required(),
    role: Joi.string().valid(
      authorizationRoles.user,
      authorizationRoles.admin,
      authorizationRoles.superadmin,
      
    ),
    username: Joi.string().min(3).max(15).required(),
    isDeleted: Joi.boolean(),
    status: Joi.string(),
    
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().min(3).max(300).required(),
  }),
 
  resetPassword: Joi.object({
    token: Joi.string().min(3).max(300).required(),
    userId: vaildObjectId().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')),
  }),
  validatedUserId: Joi.object({
    userId: vaildObjectId().required(),
  }),
};

export default userSchema;
