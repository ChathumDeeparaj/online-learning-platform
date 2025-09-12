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
    field: 'user_id',
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
    field: 'course_id',
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
    field: 'review_text',
    validate: {
      notEmpty: true,
      len: [10, 2000]
    },
    comment: 'Review text content'
  },
  responseText: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'response_text',
    validate: {
      len: [0, 1000]
    },
    comment: 'Instructor or admin response to the review'
  },
  responseBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'response_by',
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User ID of who responded to the review'
  },
  responseAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'response_at',
    comment: 'When the response was made'
  },
  isVisible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_visible',
    comment: 'Whether the review is visible to public'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified',
    comment: 'Whether the review is verified (e.g., from enrolled student)'
  },
  reviewDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'review_date',
    comment: 'Date when the review was written'
  },
  helpfulVotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'helpful_votes',
    validate: {
      min: 0
    },
    comment: 'Number of helpful votes received for this review'
  }
}, {
  tableName: 'reviews',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'course_id'],
      name: 'unique_user_course_review'
    },
    {
      fields: ['course_id', 'rating'],
      name: 'course_rating_index'
    },
    {
      fields: ['user_id'],
      name: 'user_reviews_index'
    },
    {
      fields: ['is_visible', 'is_verified'],
      name: 'review_visibility_index'
    },
    {
      fields: ['helpful_votes'],
      name: 'helpful_votes_index'
    },
    {
      fields: ['review_date'],
      name: 'review_date_index'
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

Review.prototype.addHelpfulVote = function() {
  this.helpfulVotes = (this.helpfulVotes || 0) + 1;
  return this.save();
};

Review.prototype.removeHelpfulVote = function() {
  this.helpfulVotes = Math.max(0, (this.helpfulVotes || 0) - 1);
  return this.save();
};

Review.prototype.getHelpfulPercentage = function() {
  // This would need total votes to calculate percentage
  // For now, return the vote count
  return this.helpfulVotes || 0;
};

Review.prototype.isRecent = function(days = 30) {
  const now = new Date();
  const reviewDate = new Date(this.reviewDate);
  const diffTime = Math.abs(now - reviewDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days;
};

Review.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

module.exports = Review;
