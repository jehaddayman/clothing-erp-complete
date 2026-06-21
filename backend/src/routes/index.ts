import { Router } from 'express';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';
import inventoryRoutes from './inventoryRoutes';
import customerRoutes from './customerRoutes';
import orderRoutes from './orderRoutes';
import supplierRoutes from './supplierRoutes';
import packagingRoutes from './packagingRoutes';
import shippingRoutes from './shippingRoutes';
import returnRoutes from './returnRoutes';
import accountingRoutes from './accountingRoutes';
import cashFlowRoutes from './cashFlowRoutes';
import planningRoutes from './planningRoutes';
import dashboardRoutes from './dashboardRoutes';
import reportRoutes from './reportRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/packaging', packagingRoutes);
router.use('/shipping', shippingRoutes);
router.use('/returns', returnRoutes);
router.use('/accounting', accountingRoutes);
router.use('/cashflow', cashFlowRoutes);
router.use('/planning', planningRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);

export default router;
