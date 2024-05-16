import { Request } from 'express';
import { Document } from 'mongoose';

export interface FollowT {
  name: string;
  surname: string;
  profileImage?: string;
  bio?: string;
  userId?: string;
}
export interface IUser extends Document {
  name: string;
  surname: string;
  tel:string;
  address:string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role?: string;
  status?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  userId?: string;
  gender?: string;

  timestamps?: boolean;
  cart?: {
    items: {
      productId: string;
      quantity: number;
    }[];
  };
  
}

export interface IRequestUser extends Request {
  user: IUser;
}

export interface IAuthRequest extends Request {
  headers: { authorization?: string; Authorization?: string };
  cookies: { authToken?: string; accessToken?: string; refreshToken?: string };
  user?: IUser;
}

export type CartItemT = {
  productId: string;
  quantity: number;
};
