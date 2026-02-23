import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
const adminController = new AdminController();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', adminController.getStats.bind(adminController));

// User management
router.get('/users', adminController.getAllUsers.bind(adminController));
router.post('/suspend-user/:id', adminController.suspendUser.bind(adminController));
router.post('/activate-user/:id', adminController.activateUser.bind(adminController));
router.delete('/delete-user/:id', adminController.deleteUser.bind(adminController));

// Store management
router.get('/stores', adminController.getAllStores.bind(adminController));
router.patch('/stores/:id/status', adminController.updateStoreStatus.bind(adminController));

// Seller management
router.get('/sellers', adminController.getSellers.bind(adminController));
router.patch('/sellers/:id/suspend', adminController.suspendSeller.bind(adminController));
router.delete('/sellers/:id', adminController.deleteSeller.bind(adminController));

// Delivery management
router.get('/delivery-personnel', adminController.getDeliveryPersonnel.bind(adminController));
router.patch('/delivery/:id/suspend', adminController.suspendDelivery.bind(adminController));
router.delete('/delivery/:id', adminController.deleteDelivery.bind(adminController));

// Product management
router.get('/products', adminController.getAllProducts.bind(adminController));
router.delete('/products/:id', adminController.deleteProduct.bind(adminController));

// Store management (additional endpoints)
router.delete('/stores/:id', adminController.deleteStore.bind(adminController));
router.patch('/stores/:id/suspend', adminController.suspendStore.bind(adminController));

// Registration management
router.get('/pending-registrations', adminController.getPendingRegistrations.bind(adminController));
router.get('/registrations/pending', adminController.getPendingRegistrations.bind(adminController));
router.post('/approve-registration/:id', adminController.approveRegistration.bind(adminController));
router.post('/reject-registration/:id', adminController.rejectRegistration.bind(adminController));
// PATCH aliases for frontend compatibility
router.patch('/registrations/:id/approve', adminController.approveRegistration.bind(adminController));
router.patch('/registrations/:id/reject', adminController.rejectRegistration.bind(adminController));

export default router;
