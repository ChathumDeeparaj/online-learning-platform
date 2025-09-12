/**
 * Migration: Create Reviews Table
 * This migration creates the reviews table with all necessary fields and indexes
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create reviews table
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Rating from 1 to 5 stars'
      },
      review_text: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Review text content'
      },
      response_text: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Instructor or admin response to the review'
      },
      response_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'User ID of who responded to the review'
      },
      response_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When the response was made'
      },
      is_visible: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether the review is visible to public'
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether the review is verified (e.g., from enrolled student)'
      },
      review_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Date when the review was written'
      },
      helpful_votes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of helpful votes received for this review'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add constraints
    await queryInterface.addConstraint('reviews', {
      fields: ['rating'],
      type: 'check',
      name: 'reviews_rating_check',
      where: {
        rating: {
          [Sequelize.Op.between]: [1, 5]
        }
      }
    });

    await queryInterface.addConstraint('reviews', {
      fields: ['helpful_votes'],
      type: 'check',
      name: 'reviews_helpful_votes_check',
      where: {
        helpful_votes: {
          [Sequelize.Op.gte]: 0
        }
      }
    });

    // Add indexes
    await queryInterface.addIndex('reviews', {
      fields: ['user_id', 'course_id'],
      unique: true,
      name: 'unique_user_course_review'
    });

    await queryInterface.addIndex('reviews', {
      fields: ['course_id', 'rating'],
      name: 'course_rating_index'
    });

    await queryInterface.addIndex('reviews', {
      fields: ['user_id'],
      name: 'user_reviews_index'
    });

    await queryInterface.addIndex('reviews', {
      fields: ['is_visible', 'is_verified'],
      name: 'review_visibility_index'
    });

    await queryInterface.addIndex('reviews', {
      fields: ['helpful_votes'],
      name: 'helpful_votes_index'
    });

    await queryInterface.addIndex('reviews', {
      fields: ['review_date'],
      name: 'review_date_index'
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop the reviews table
    await queryInterface.dropTable('reviews');
  }
};


