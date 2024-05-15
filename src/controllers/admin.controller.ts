import { NextFunction, Request, Response } from 'express';
import {
  // adminAddProductService,
  // adminAddUserService,
  // adminDeleteProductService,
  // adminGetProductService,
  // adminGetProductsService,
  adminGetUserService,
  adminGetUsersService,
  // adminUpdateProductService,
  // removeAuthService,
  // adminUpdateAuthService,
  // adminGetOrdersService,
  // adminGetOrderService,
  // adminDeleteSingleOrderService,
  // adminDeleteAllOrderForGivenUserService,
  // adminClearAllOrdersService,
  // adminGetAllOrdersForGivenUserService,
  // adminUpdateOrderStatusService,
  // adminGetPostsService,
  // adminCreatePostService,
  // adminGetPostService,
  // adminDeletePostService,
  // adminClearAllPostsService,
  // adminUpdatePostService,
  // adminDeleteAllPostForGivenUserService,
  // adminClearAllProductsService,
  // adminDeleteAllCommentInPostService,
  // adminDeleteCommentInPostService,
} from '../services';
import {
  AuthenticatedRequestBody,
  IUser,
  IPost,
  ProcessingOrderT,
  ProductT,
  TPaginationResponse,
  UpdateCommentT,
} from '../interfaces';



export const adminGetUsersController = (req: Request, res: TPaginationResponse) => adminGetUsersService(req, res);

export const adminGetUserController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  adminGetUserService(req, res, next);


export default adminGetUsersController;
