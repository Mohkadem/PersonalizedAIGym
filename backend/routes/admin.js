const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// All admin routes require admin authentication
router.use(auth.authenticateToken);
router.use(auth.requireRole('admin'));

// Dashboard stats
router.get('/dashboard/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/profile', adminController.updateUserProfile);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/status', adminController.updateUserStatus);

// Coach management
router.post('/coaches', adminController.createCoach);
router.post('/coaches/assign', adminController.assignCoachToClient);
router.delete('/coaches/unassign', adminController.removeCoachFromClient);

// Admin management
router.post('/admins', adminController.createAdmin);

module.exports = router;