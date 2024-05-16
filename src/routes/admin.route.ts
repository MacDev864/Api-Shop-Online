import express from 'express';

import {
  addPostValidation,
  addProductValidation,
  customRoles,
  deleteCommentValidation,
  isSuperadmin,
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
  adminAddProductController,
  adminAddUserController,
  adminClearAllProductsController,
  adminDeleteProductController,
//   adminDeleteSingleOrderController,
//   adminGetAllOrdersForGivenUserController,
//   adminGetOrderController,
//   adminGetOrdersController,
//   adminGetPostController,
//   adminGetPostsController,
  adminGetProductController,
  adminGetProductsController,
  adminGetUserController,
  adminGetUsersController,
  adminRemoveUserController,
  adminUpdateAuthController,
//   adminUpdateOrderStatusController,
//   adminUpdatePostController,
  adminUpdateProductController,
} from '../controllers/admin.controller';
import { environmentConfig } from '../configs';
// import { adminClearAllPostsService, adminDeleteAllOrderForGivenUserService } from '@src/services';
import { authorizationRoles } from '../constants';
import checkIsAdmin, { checkRoleAdmin } from '../middlewares/auth/checkIsAdmin';

const router = express.Router();
/* Users manage By Super admin   */
router.get('/users', isAuth, isSuperadmin, usersPaginationMiddleware(), adminGetUsersController);
router.get('/users/:userId', isAuth,isSuperadmin, adminGetUserController);
router.post(
  '/users/add',
  isAuth,
  isSuperadmin,
  signupUserValidation,
  adminAddUserController
);
router.put(
  '/users/update/:userId',
  isAuth,
  isSuperadmin,
  updateUserValidation,
  adminUpdateAuthController
);
router.delete(
  '/users/remove/:userId',
  isAuth,
  isSuperadmin,
  userIdValidation,
  adminRemoveUserController
);
/* Users manage By Super admin   */
router.post(
  '/products/add',
  isAuth,
  checkRoleAdmin,
  addProductValidation,
  adminAddProductController
);
router.put(
  '/products/update/:productId',
  isAuth,
  isAuth,
  checkRoleAdmin,
  updateProductValidation,
  adminUpdateProductController
);
router.get(
  '/products',
  isAuth,
checkRoleAdmin,
  productsPaginationMiddleware(),
  adminGetProductsController
);
router.get(
  '/products/:productId',
  isAuth,
checkRoleAdmin,

  adminGetProductController
);
router.delete(
  '/products/delete/:productId',
  isAuth,
checkRoleAdmin,

  productIdValidation,
  adminDeleteProductController
);
router.delete(
  '/products/clear-all-products',
  isAuth,
checkRoleAdmin,

  adminClearAllProductsController
);
export default router;
