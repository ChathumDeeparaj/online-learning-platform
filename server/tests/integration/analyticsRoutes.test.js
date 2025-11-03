const request = require('supertest');
const express = require('express');
const analyticsRoutes = require('../../routes/analytics');
const analyticsService = require('../../services/analyticsService');
const reportingService = require('../../services/reportingService');

// Mock authentication middleware
jest.mock('../../middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, role: 'admin' };
    next();
  },
  authorize: (role) => (req, res, next) => {
    if (req.user && req.user.role === role) {
      return next();
    }
    return res.status(403).json({ success: false, error: 'Forbidden' });
  },
}));

jest.mock('../../services/analyticsService');
jest.mock('../../services/reportingService');

const app = express();
app.use(express.json());
app.use('/api/analytics', analyticsRoutes);

describe('Analytics API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/analytics/dashboard', () => {
    it('should return dashboard statistics', async () => {
      const mockEngagement = { dailyActiveUsers: 100, monthlyActiveUsers: 500 };
      const mockPopularity = [{ courseId: 1, enrollments: 50 }];
      const mockRevenue = { totalRevenue: 10000 };

      analyticsService.getUserEngagement.mockResolvedValue(mockEngagement);
      analyticsService.getCoursePopularity.mockResolvedValue(mockPopularity);
      analyticsService.getRevenueAnalytics.mockResolvedValue(mockRevenue);

      const response = await request(app)
        .get('/api/analytics/dashboard')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          engagement: mockEngagement,
          popularity: mockPopularity,
          revenue: mockRevenue,
        },
      });
    });

    it('should handle service errors', async () => {
      analyticsService.getUserEngagement.mockRejectedValue(
        new Error('Service error')
      );

      const response = await request(app)
        .get('/api/analytics/dashboard')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Service error');
    });
  });

  describe('GET /api/analytics/activities', () => {
    it('should return all tracked activities', async () => {
      const mockActivities = [
        { userId: 1, path: '/test', method: 'GET' },
        { userId: 2, path: '/other', method: 'POST' },
      ];

      analyticsService.getActivities.mockReturnValue(mockActivities);

      const response = await request(app)
        .get('/api/analytics/activities')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockActivities,
      });
    });
  });

  describe('GET /api/analytics/user-engagement', () => {
    it('should return user engagement metrics', async () => {
      const mockData = {
        dailyActiveUsers: 150,
        monthlyActiveUsers: 600,
        userSignups: 30,
      };

      analyticsService.getUserEngagement.mockResolvedValue(mockData);

      const response = await request(app)
        .get('/api/analytics/user-engagement')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockData);
    });
  });

  describe('GET /api/analytics/course-popularity', () => {
    it('should return course popularity data', async () => {
      const mockData = [
        { courseId: 1, courseName: 'Course A', enrollments: 100 },
        { courseId: 2, courseName: 'Course B', enrollments: 75 },
      ];

      analyticsService.getCoursePopularity.mockResolvedValue(mockData);

      const response = await request(app)
        .get('/api/analytics/course-popularity')
        .expect(200);

      expect(response.body.data).toEqual(mockData);
    });
  });

  describe('GET /api/analytics/revenue', () => {
    it('should return revenue analytics', async () => {
      const mockData = {
        totalRevenue: 50000,
        monthlyRevenue: 5000,
        averageRevenuePerUser: 125,
      };

      analyticsService.getRevenueAnalytics.mockResolvedValue(mockData);

      const response = await request(app)
        .get('/api/analytics/revenue')
        .expect(200);

      expect(response.body.data).toEqual(mockData);
    });
  });

  const fs = require('fs');
const path = require('path');

describe('GET /api/analytics/export/enrollments', () => {
  const mockData = [{ enrollmentId: 1, user: 'John Doe' }];
  const mockFilePath = path.join(__dirname, 'enrollment_report.json');

  beforeEach(() => {
    fs.writeFileSync(mockFilePath, JSON.stringify(mockData));
  });

  afterEach(() => {
    fs.unlinkSync(mockFilePath);
  });

  it('should download enrollment report as JSON', async () => {
    reportingService.generateEnrollmentReport.mockResolvedValue(mockData);
    reportingService.exportReportToFile.mockResolvedValue(mockFilePath);

    await request(app)
      .get('/api/analytics/export/enrollments')
      .query({ format: 'json' })
      .expect(200);

    expect(reportingService.generateEnrollmentReport).toHaveBeenCalled();
    expect(reportingService.exportReportToFile).toHaveBeenCalledWith(
      mockData,
      'enrollment_report.json',
      'json'
    );
  });

  it('should download enrollment report as CSV', async () => {
    const csvMockFilePath = path.join(__dirname, 'enrollment_report.csv');
    fs.writeFileSync(csvMockFilePath, 'enrollmentId,user\n1,John Doe');

    reportingService.generateEnrollmentReport.mockResolvedValue(mockData);
    reportingService.exportReportToFile.mockResolvedValue(csvMockFilePath);

    await request(app)
      .get('/api/analytics/export/enrollments')
      .query({ format: 'csv' })
      .expect(200);

    expect(reportingService.exportReportToFile).toHaveBeenCalledWith(
      mockData,
      'enrollment_report.csv',
      'csv'
    );

    fs.unlinkSync(csvMockFilePath);
  });
});

  describe('GET /api/analytics/export/revenue', () => {
    const mockData = [{ paymentId: 1, amount: 100 }];
    const mockFilePath = path.join(__dirname, 'revenue_report.json');

    beforeEach(() => {
      fs.writeFileSync(mockFilePath, JSON.stringify(mockData));
    });

    afterEach(() => {
      fs.unlinkSync(mockFilePath);
    });

    it('should download revenue report', async () => {
      reportingService.generateRevenueReport.mockResolvedValue(mockData);
      reportingService.exportReportToFile.mockResolvedValue(mockFilePath);

      await request(app)
        .get('/api/analytics/export/revenue')
        .expect(200);

      expect(reportingService.generateRevenueReport).toHaveBeenCalled();
    });
  });

  describe('GET /api/analytics/custom-report', () => {
    const mockData = [{ id: 1 }];
    const mockFilePath = path.join(__dirname, 'custom_report.json');

    beforeEach(() => {
      fs.writeFileSync(mockFilePath, JSON.stringify(mockData));
    });

    afterEach(() => {
      fs.unlinkSync(mockFilePath);
    });

    it('should generate custom enrollment report', async () => {
      reportingService.generateEnrollmentReport.mockResolvedValue(mockData);
      reportingService.exportReportToFile.mockResolvedValue(mockFilePath);

      await request(app)
        .get('/api/analytics/custom-report')
        .query({
          type: 'enrollment',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          format: 'json',
        })
        .expect(200);

      expect(reportingService.generateEnrollmentReport).toHaveBeenCalledWith({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });
    });

    it('should generate custom revenue report', async () => {
      const csvMockFilePath = path.join(__dirname, 'custom_report.csv');
      fs.writeFileSync(csvMockFilePath, 'id\n1');

      reportingService.generateRevenueReport.mockResolvedValue(mockData);
      reportingService.exportReportToFile.mockResolvedValue(csvMockFilePath);

      await request(app)
        .get('/api/analytics/custom-report')
        .query({
          type: 'revenue',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          format: 'csv',
        })
        .expect(200);

      fs.unlinkSync(csvMockFilePath);
    });

    it('should generate custom user-activity report', async () => {
      reportingService.generateUserActivityReport.mockResolvedValue(mockData);
      reportingService.exportReportToFile.mockResolvedValue(mockFilePath);

      await request(app)
        .get('/api/analytics/custom-report')
        .query({
          type: 'user-activity',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        })
        .expect(200);
    });

    it('should return 400 for invalid report type', async () => {
      const response = await request(app)
        .get('/api/analytics/custom-report')
        .query({ type: 'invalid-type' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid report type');
    });
  });
});