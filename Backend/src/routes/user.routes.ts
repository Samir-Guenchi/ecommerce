import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Current user endpoints (must be before /:id to avoid conflicts)
router.get('/me', userController.getCurrentUser.bind(userController));
router.patch('/me', userController.updateCurrentUser.bind(userController));
router.patch('/me/account-type', userController.updateAccountType.bind(userController));

// Admin-only routes
router.get('/', userController.getAllUsers.bind(userController));
router.get('/:id', userController.getUserById.bind(userController));
router.patch('/:id/status', userController.updateUserStatus.bind(userController));
router.delete('/:id', userController.deleteUser.bind(userController));

export default router;








