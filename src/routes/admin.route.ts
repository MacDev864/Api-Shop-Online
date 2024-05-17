import express from 'express';

import {
  addProductValidation,
  customRoles,
  isSuperadmin,
  isAuth,
  productIdValidation,
  productsPaginationMiddleware,
  signupUserValidation,
  updateOrderStatusValidation,
  updateProductValidation,
  updateUserValidation,
  userIdValidation,
  usersPaginationMiddleware,
  topBestSelling,
  ordersPaginationMiddleware,
} from '../middlewares';
import {
  adminAddProductController,
  adminAddUserController,
  adminClearAllProductsController,
  adminDeleteProductController,
  adminDeleteSingleOrderController,
  adminGetAllOrdersForGivenUserController,
  adminGetOrderController,
  adminGetOrdersController,
  adminClearAllOrdersController,
  adminGetProductController,
  adminGetProductsController,
  adminGetUserController,
  adminGetUsersController,
  adminRemoveUserController,
  adminUpdateAuthController,
  adminUpdateOrderStatusController,
  adminUpdateProductController,
  adminDeleteAllOrderForGivenUserController,
  adminGetTopBestSellingController,
} from '../controllers';
import { environmentConfig } from '../configs';
import { authorizationRoles } from '../constants';
import checkIsAdmin, { checkRoleAdmin } from '../middlewares/auth/checkIsAdmin';

const router = express.Router();
/* Users manage By Super admin   */
router.get('/users', isAuth, isSuperadmin, usersPaginationMiddleware(), adminGetUsersController);
router.get('/dashboard/top-10-bestselling', isAuth, checkRoleAdmin, topBestSelling,ordersPaginationMiddleware, adminGetTopBestSellingController);
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
router.get(
  '/orders',
  checkRoleAdmin,
  isAuth,
  adminGetOrdersController
);
router.delete(
  '/orders/clear-all-orders',
  isAuth,
  checkRoleAdmin,
  adminClearAllOrdersController
);
router.get(
  '/orders/get-user-order/:userId',
  isAuth,
  checkRoleAdmin,
  adminGetAllOrdersForGivenUserController
);
router
  .route('/orders/:orderId')
  .get(
    isAuth, 
    checkRoleAdmin,
    adminGetOrderController
  )
  .patch(
    isAuth,
    checkRoleAdmin,
      updateOrderStatusValidation,
    adminUpdateOrderStatusController
  )
  .delete(
    isAuth,
    checkRoleAdmin,
      adminDeleteSingleOrderController
  );

router.delete(
  '/orders/clear-user-order/:userId',
  isAuth,
  checkRoleAdmin,
  adminDeleteAllOrderForGivenUserController
);


export default router;
