const { Review, User, Course, Enrollment } = require('../models');
const { validationResult } = require('express-validator');
const createError = require('http-errors');

// Create a new review
exports.createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, 'Validation Error', { errors: errors.array() });
    }

    const { courseId, rating, comment } = req.body;
    const userId = req.user.id;

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      where: { userId, courseId }
    });

    if (!enrollment) {
      throw createError(403, 'You must be enrolled in the course to leave a review');
    }

    // Check if user has already reviewed this course
    const existingReview = await Review.findOne({
      where: { userId, courseId }
    });

    if (existingReview) {
      throw createError(400, 'You have already reviewed this course');
    }

    const review = await Review.create({
      userId,
      courseId,
      rating,
      comment
    });

    // Calculate new average rating for the course
    const courseReviews = await Review.findAll({
      where: { courseId },
      attributes: ['rating']
    });

    const avgRating = courseReviews.reduce((acc, curr) => acc + curr.rating, 0) / courseReviews.length;

    // Update course rating
    await Course.update(
      { rating: avgRating },
      { where: { id: courseId } }
    );

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// Get all reviews for a course
exports.getCourseReviews = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const reviews = await Review.findAndCountAll({
      where: { courseId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'profileImage']
      }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      data: reviews.rows,
      pagination: {
        total: reviews.count,
        page,
        pages: Math.ceil(reviews.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update a review
exports.updateReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, 'Validation Error', { errors: errors.array() });
    }

    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findOne({
      where: { id }
    });

    if (!review) {
      throw createError(404, 'Review not found');
    }

    if (review.userId !== userId) {
      throw createError(403, 'You can only update your own reviews');
    }

    await review.update({
      rating: rating || review.rating,
      comment: comment || review.comment
    });

    // Recalculate course average rating
    const courseReviews = await Review.findAll({
      where: { courseId: review.courseId },
      attributes: ['rating']
    });

    const avgRating = courseReviews.reduce((acc, curr) => acc + curr.rating, 0) / courseReviews.length;

    await Course.update(
      { rating: avgRating },
      { where: { id: review.courseId } }
    );

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// Delete a review
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({
      where: { id }
    });

    if (!review) {
      throw createError(404, 'Review not found');
    }

    // Allow admin or review owner to delete
    if (review.userId !== userId && req.user.role !== 'admin') {
      throw createError(403, 'You can only delete your own reviews');
    }

    const courseId = review.courseId;

    await review.destroy();

    // Recalculate course average rating
    const courseReviews = await Review.findAll({
      where: { courseId },
      attributes: ['rating']
    });

    const avgRating = courseReviews.length 
      ? courseReviews.reduce((acc, curr) => acc + curr.rating, 0) / courseReviews.length
      : 0;

    await Course.update(
      { rating: avgRating },
      { where: { id: courseId } }
    );

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
