import express from 'express';
import homeRoute from "../routes/home.route";
import adminRoutes from "../routes/admin.route";
import authRoutes from "../routes/auth.route";
import healthCheckRoute from "../routes/healthCheck.route";
import productRoutes from "../routes/product.route";
import cartRoutes from "../routes/cart.route";
import orderRoutes from "../routes/order.route";
const router = express.Router()
router.use('/', homeRoute);
router.use('/healthChecker', healthCheckRoute);
router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

router.use('/cart', cartRoutes);

export default router;
