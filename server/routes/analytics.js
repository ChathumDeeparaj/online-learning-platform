// Real-time dashboard endpoint
router.get('/dashboard', analyticsController.getDashboardStats);

// Custom report generation endpoint
router.get('/custom-report', analyticsController.customReport);
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

// All analytics routes should be protected and accessible only by admins.
router.use(authenticate, authorize('admin'));


router.get('/activities', analyticsController.getActivities);
router.get('/user-engagement', analyticsController.getUserEngagement);
router.get('/course-popularity', analyticsController.getCoursePopularity);
router.get('/revenue', analyticsController.getRevenueAnalytics);

// Export endpoints
router.get('/export/enrollments', analyticsController.exportEnrollmentReport);
router.get('/export/revenue', analyticsController.exportRevenueReport);

module.exports = router;
