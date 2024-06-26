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
  adminGetOrdersService,
  adminGetOrderService,
  adminDeleteSingleOrderService,
  adminDeleteAllOrderForGivenUserService,
  adminClearAllOrdersService,
  adminGetAllOrdersForGivenUserService,
  adminUpdateOrderStatusService,
  adminClearAllProductsService,
  adminGetTopBestSellingService,
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
export const adminGetOrdersController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  adminGetOrdersService(req, res, next);
export const adminGetOrderController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  adminGetOrderService(req, res, next);
export const adminGetAllOrdersForGivenUserController = (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => adminGetAllOrdersForGivenUserService(req, res, next);

export const adminDeleteSingleOrderController = (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => adminDeleteSingleOrderService(req, res, next);

export const adminDeleteAllOrderForGivenUserController = (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => adminDeleteAllOrderForGivenUserService(req, res, next);

export const adminClearAllOrdersController = (
  req: AuthenticatedRequestBody<IUser>,
  res: Response,
  next: NextFunction
) => adminClearAllOrdersService(req, res, next);

export const adminUpdateOrderStatusController = (
  req: AuthenticatedRequestBody<ProcessingOrderT>,
  res: Response,
  next: NextFunction
) => adminUpdateOrderStatusService(req, res, next);

export const adminGetTopBestSellingController = (
  req: AuthenticatedRequestBody<ProcessingOrderT>,
  res: Response,
  next: NextFunction
) => adminGetTopBestSellingService
export default adminGetUsersController;
