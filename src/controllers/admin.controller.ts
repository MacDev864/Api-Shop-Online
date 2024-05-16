import { NextFunction, Request, Response } from 'express';
import {
  adminAddProductService,
  adminAddUserService,
  adminDeleteProductService,
  adminGetProductService,
  adminGetProductsService,
  adminGetUserService,
  adminGetUsersService,
  adminUpdateProductService,
  removeAuthService,
  adminUpdateAuthService,
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
  adminClearAllProductsService,
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

export const adminAddUserController = (req: Request, res: Response, next: NextFunction) =>
  adminAddUserService(req, res, next);

export const adminUpdateAuthController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  adminUpdateAuthService(req, res, next);

export const adminRemoveUserController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  removeAuthService(req, res, next);
export const adminAddProductController = (req: AuthenticatedRequestBody<ProductT>, res: Response, next: NextFunction) =>
  adminAddProductService(req, res, next);

export const adminUpdateProductController = (
  req: AuthenticatedRequestBody<ProductT>,
  res: Response,
  next: NextFunction
) => adminUpdateProductService(req, res, next);

export const adminDeleteProductController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  adminDeleteProductService(req, res, next);

export const adminClearAllProductsController = (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => adminClearAllProductsService(req, res, next);
export const adminGetProductController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  adminGetProductService(req, res, next);
export const adminGetProductsController = (req: Request, res: TPaginationResponse) => adminGetProductsService(req, res);

export default adminGetUsersController;
