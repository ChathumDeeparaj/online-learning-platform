const { body } = require('express-validator');

const reviewValidationRules = {
  create: [
    body('courseId')
      .isInt()
      .withMessage('Course ID must be an integer'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Comment must be between 10 and 1000 characters')
  ],
  update: [
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Comment must be between 10 and 1000 characters')
  ]
};

module.exports = reviewValidationRules;
