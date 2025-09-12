const { sequelize, User, Course, Review, syncDatabase } = require('../models');

describe('Review Model & Migration', () => {
  let user, course;

  beforeAll(async () => {
    await syncDatabase(true);
    user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'password',
      role: 'student'
    });
    course = await Course.create({
      title: 'Test Course',
      description: 'A course for testing',
      price: 10,
      duration: 1,
      level: 'beginner',
      category: 'Test',
      currency: 'USD'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a review with rating, text, date, and helpful votes', async () => {
    const review = await Review.create({
      userId: user.id,
      courseId: course.id,
      rating: 5,
      reviewText: 'Excellent course!',
      reviewDate: new Date(),
      helpfulVotes: 2
    });
    expect(review).toBeDefined();
    expect(review.rating).toBe(5);
    expect(review.reviewText).toBe('Excellent course!');
    expect(review.helpfulVotes).toBe(2);
    expect(review.reviewDate).toBeInstanceOf(Date);
  });

  it('should not allow rating outside 1-5', async () => {
    await expect(Review.create({
      userId: user.id,
      courseId: course.id,
      rating: 6,
      reviewText: 'Invalid rating',
      reviewDate: new Date(),
      helpfulVotes: 0
    })).rejects.toThrow();
  });

  it('should enforce user-course unique review', async () => {
    // Use a fresh user and course for this test
    const uniqueUser = await User.create({
      firstName: 'Unique',
      lastName: 'User',
      email: `uniqueuser${Date.now()}@example.com`,
      password: 'password',
      role: 'student'
    });
    const uniqueCourse = await Course.create({
      title: 'Unique Course',
      description: 'A unique course for testing',
      price: 99,
      duration: 1,
      level: 'beginner',
      category: 'Test',
      currency: 'USD'
    });
    await Review.create({
      userId: uniqueUser.id,
      courseId: uniqueCourse.id,
      rating: 4,
      reviewText: 'Good course',
      reviewDate: new Date(),
      helpfulVotes: 1
    });
    let errorCaught = false;
    try {
      await Review.create({
        userId: uniqueUser.id,
        courseId: uniqueCourse.id,
        rating: 3,
        reviewText: 'Duplicate review',
        reviewDate: new Date(),
        helpfulVotes: 0
      });
    } catch (err) {
      // SequelizeUniqueConstraintError is the expected error
      if (err.name === 'SequelizeUniqueConstraintError' || (err.parent && err.parent.code === 'ER_DUP_ENTRY')) {
        errorCaught = true;
      } else {
        throw err;
      }
    }
    expect(errorCaught).toBe(true);
  });

  it('should default helpfulVotes to 0 and reviewDate to now', async () => {
    const newCourse = await Course.create({
      title: 'Another Course',
      description: 'Another course for testing',
      price: 20,
      duration: 2,
      level: 'beginner',
      category: 'Test',
      currency: 'USD'
    });
    const review = await Review.create({
      userId: user.id,
      courseId: newCourse.id,
      rating: 4,
      reviewText: 'Another review'
    });
    expect(review.helpfulVotes).toBe(0);
    expect(review.reviewDate).toBeInstanceOf(Date);
  });
});
