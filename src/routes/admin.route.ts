import express from 'express';

import {
  addPostValidation,
  addProductValidation,
  customRoles,
  deleteCommentValidation,
  isAdmin,
  isAuth,
  postIdValidation,
  postPaginationMiddleware,
  productIdValidation,
  productsPaginationMiddleware,
  signupUserValidation,
  updateOrderStatusValidation,
  updatePostValidation,
  updateProductValidation,
  updateUserValidation,
  uploadImage,
  userIdValidation,
  usersPaginationMiddleware,
} from '../middlewares';
import {
//   adminAddProductController,
//   adminAddUserController,
//   adminClearAllOrdersController,
//   adminClearAllProductsController,
//   adminCreatePostController,
//   adminDeleteAllCommentInPostController,
//   adminDeleteAllPostForGivenUserController,
//   adminDeleteCommentInPostController,
//   adminDeletePostController,
//   adminDeleteProductController,
//   adminDeleteSingleOrderController,
//   adminGetAllOrdersForGivenUserController,
//   adminGetOrderController,
//   adminGetOrdersController,
//   adminGetPostController,
//   adminGetPostsController,
//   adminGetProductController,
//   adminGetProductsController,
  adminGetUserController,
  adminGetUsersController,
//   adminRemoveUserController,
//   adminUpdateAuthController,
//   adminUpdateOrderStatusController,
//   adminUpdatePostController,
//   adminUpdateProductController,
} from '../controllers/admin.controller';
import { environmentConfig } from '../configs';
// import { adminClearAllPostsService, adminDeleteAllOrderForGivenUserService } from '@src/services';
import { authorizationRoles } from '../constants';

const router = express.Router();

router.get('/users', isAuth, isAdmin, usersPaginationMiddleware(), adminGetUsersController);
router.get('/users/:userId', isAuth, adminGetUserController);


export default router;
