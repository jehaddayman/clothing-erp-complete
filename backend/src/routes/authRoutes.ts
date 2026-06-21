import { Router } from 'express';
import * as authController from '../controllers/authController';
import { registerValidator, loginValidator } from '../validators/authValidators';
import { validate } from '../middleware/validate';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

export default router;
