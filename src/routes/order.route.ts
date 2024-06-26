import express from 'express';

import { isAuth, orderIdValidation, processingOrderValidation } from '../middlewares';
import {
  clearAllOrdersController,
  clearSingleOrderController,
  getInvoicesController,
  getOrderController,
  getOrdersController,
  postOrderController,
} from '../controllers/order.controller';

const router = express.Router();

router.get('/', isAuth, getOrdersController);
router.get('/:orderId', isAuth, orderIdValidation, getOrderController);
router.post('/', isAuth, processingOrderValidation, postOrderController);
router.delete('/clear-orders', isAuth, clearAllOrdersController);
router.delete('/:orderId', isAuth, orderIdValidation, clearSingleOrderController);
// router.get('/invoices/:orderId', isAuth, orderIdValidation, getInvoicesController);

export default router;
