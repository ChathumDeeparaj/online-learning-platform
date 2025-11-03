const analyticsService = require('../../services/analyticsService');
const User = require('../../models/User');
const Enrollment = require('../../models/Enrollment');
const Payment = require('../../models/Payment');
const Course = require('../../models/Course');

// Mock the models
jest.mock('../../models/User');
jest.mock('../../models/Enrollment');
jest.mock('../../models/Payment');
jest.mock('../../models/Course');
jest.mock('../../services/dataProcessingService');

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear in-memory activities array
    while(analyticsService.getActivities().length > 0) {
      analyticsService.getActivities().pop();
    }
  });

  describe('logActivity', () => {
    it('should log activity to in-memory array', () => {
      const activity = {
        userId: 1,
        sessionId: 'test-session',
        method: 'GET',
        path: '/test',
        timestamp: new Date(),
      };

      analyticsService.logActivity(activity);
      
      const activities = analyticsService.getActivities();
      expect(activities).toHaveLength(1);
      expect(activities[0]).toMatchObject(activity);
    });
  });

  describe('getUserEngagement', () => {
    it('should return daily and monthly active users', async () => {
      User.count.mockResolvedValue(5);
      
      // Add some mock activities
      const now = new Date();
      const activities = [
        { userId: 1, timestamp: now },
        { userId: 2, timestamp: now },
        { userId: 1, timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
      ];
      
      activities.forEach(act => analyticsService.logActivity(act));

      const result = await analyticsService.getUserEngagement();

      expect(result).toHaveProperty('dailyActiveUsers');
      expect(result).toHaveProperty('monthlyActiveUsers');
      expect(result).toHaveProperty('userSignups');
      expect(result.dailyActiveUsers).toBe(2); // 2 unique users
      expect(result.userSignups).toBe(5);
    });

    it('should handle activities without timestamps', async () => {
      User.count.mockResolvedValue(0);
      
      analyticsService.logActivity({ userId: 1 }); // No timestamp

      const result = await analyticsService.getUserEngagement();
      
      expect(result.dailyActiveUsers).toBe(0);
      expect(result.monthlyActiveUsers).toBe(0);
    });
  });

  describe('getCoursePopularity', () => {
    it('should return top courses by enrollments', async () => {
      const mockEnrollments = [
        {
          courseId: 1,
          get: jest.fn(() => 100),
          course: { title: 'Course 1' },
        },
        {
          courseId: 2,
          get: jest.fn(() => 50),
          course: { title: 'Course 2' },
        },
      ];

      Enrollment.findAll.mockResolvedValue(mockEnrollments);

      const result = await analyticsService.getCoursePopularity();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        courseId: 1,
        courseName: 'Course 1',
        enrollments: 100,
      });
      expect(result[1]).toEqual({
        courseId: 2,
        courseName: 'Course 2',
        enrollments: 50,
      });
      expect(Enrollment.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
        })
      );
    });

    it('should handle courses without titles', async () => {
      const mockEnrollments = [
        {
          courseId: 1,
          get: jest.fn(() => 100),
          course: null,
        },
      ];

      Enrollment.findAll.mockResolvedValue(mockEnrollments);

      const result = await analyticsService.getCoursePopularity();

      expect(result[0].courseName).toBeNull();
    });
  });

  describe('getRevenueAnalytics', () => {
    it('should calculate total and monthly revenue', async () => {
      Payment.sum.mockResolvedValueOnce(10000); // total
      Payment.sum.mockResolvedValueOnce(2000); // monthly
      User.count.mockResolvedValue(100);

      const result = await analyticsService.getRevenueAnalytics();

      expect(result.totalRevenue).toBe(10000);
      expect(result.monthlyRevenue).toBe(2000);
      expect(result.averageRevenuePerUser).toBe(100);
    });

    it('should handle null revenue values', async () => {
      Payment.sum.mockResolvedValueOnce(null); // total
      Payment.sum.mockResolvedValueOnce(null); // monthly
      User.count.mockResolvedValue(0);

      const result = await analyticsService.getRevenueAnalytics();

      expect(result.totalRevenue).toBe(0);
      expect(result.monthlyRevenue).toBe(0);
      expect(result.averageRevenuePerUser).toBe(0);
    });

    it('should call Payment.sum with correct filters', async () => {
      Payment.sum.mockResolvedValue(0);
      User.count.mockResolvedValue(0);

      await analyticsService.getRevenueAnalytics();

      expect(Payment.sum).toHaveBeenCalledWith('amount', {
        where: { status: 'succeeded' },
      });
    });
  });

  describe('logSessionStart', () => {
    it('should log session start event', () => {
      const session = {
        userId: 1,
        sessionId: 'test-session',
        startedAt: new Date(),
      };

      expect(() => analyticsService.logSessionStart(session)).not.toThrow();
    });
  });

  describe('logSessionEnd', () => {
    it('should log session end event', () => {
      const session = {
        userId: 1,
        sessionId: 'test-session',
        endedAt: new Date(),
      };

      expect(() => analyticsService.logSessionEnd(session)).not.toThrow();
    });
  });
});