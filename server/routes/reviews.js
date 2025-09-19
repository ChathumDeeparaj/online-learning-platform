const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const reviewValidationRules = require('../middleware/reviewValidation');
const reviewController = require('../controllers/reviewController');

// Create a new review
router.post(
  '/',
  authenticate,
  reviewValidationRules.create,
  reviewController.createReview
);

// Get all reviews for a course
router.get(
  '/courses/:id/reviews',
  reviewController.getCourseReviews
);

// Update a review
router.put(
  '/:id',
  authenticate,
  reviewValidationRules.update,
  reviewController.updateReview
);

// Delete a review
router.delete(
  '/:id',
  authenticate,
  reviewController.deleteReview
);

module.exports = router;
