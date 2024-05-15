import express from 'express';
import homeRoute from "../routes/home.route";
import adminRoutes from "../routes/admin.route";
import authRoutes from "../routes/auth.route";
import healthCheckRoute from "../routes/healthCheck.route";
const router = express.Router()
router.use('/', homeRoute);
router.use('/healthChecker', healthCheckRoute);
router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);


export default router;
