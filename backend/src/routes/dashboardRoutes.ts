import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/summary', dashboardController.getSummary);
router.get('/sales-chart', dashboardController.getMonthlySalesChart);
router.get('/recent-activity', dashboardController.getRecentActivity);

export default router;
