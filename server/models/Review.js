const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    validate: {
      notNull: true
    }
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    },
    validate: {
      notNull: true
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
      notNull: true
    },
    comment: 'Rating from 1 to 5 stars'
  },
  reviewText: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 2000]
    },
    comment: 'Review text content'
  },
  responseText: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    },
    comment: 'Instructor or admin response to the review'
  },
  responseBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User ID of who responded to the review'
  },
  responseAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the response was made'
  },
  isVisible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether the review is visible to public'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether the review is verified (e.g., from enrolled student)'
  }
}, {
  tableName: 'reviews',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'courseId'],
      name: 'unique_user_course_review'
    },
    {
      fields: ['courseId', 'rating'],
      name: 'course_rating_index'
    },
    {
      fields: ['userId'],
      name: 'user_reviews_index'
    },
    {
      fields: ['isVisible', 'isVerified'],
      name: 'review_visibility_index'
    }
  ],
  validate: {
    responseRequiresResponder() {
      if (this.responseText && !this.responseBy) {
        throw new Error('Response text requires a responder');
      }
    },
    responseRequiresText() {
      if (this.responseBy && !this.responseText) {
        throw new Error('Responder requires response text');
      }
    }
  }
});

// Instance methods
Review.prototype.getFormattedRating = function() {
  return `${this.rating}/5 stars`;
};

Review.prototype.getReviewSummary = function() {
  const maxLength = 100;
  if (this.reviewText.length <= maxLength) {
    return this.reviewText;
  }
  return this.reviewText.substring(0, maxLength) + '...';
};

Review.prototype.hasResponse = function() {
  return !!(this.responseText && this.responseBy);
};

Review.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

module.exports = Review;
