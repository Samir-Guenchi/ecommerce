import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Admin-only routes
router.get('/', userController.getAllUsers.bind(userController));
router.get('/:id', userController.getUserById.bind(userController));
router.patch('/:id/status', userController.updateUserStatus.bind(userController));
router.delete('/:id', userController.deleteUser.bind(userController));

export default router;








