const analyticsController = require('../../controllers/analyticsController');
const analyticsService = require('../../services/analyticsService');
const reportingService = require('../../services/reportingService');

jest.mock('../../services/analyticsService');
jest.mock('../../services/reportingService');

describe('Analytics Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      query: {},
      params: {},
      user: { id: 1, role: 'admin' },
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      download: jest.fn(),
    };
  });

  describe('getActivities', () => {
    it('should return all activities', () => {
      const mockActivities = [
        { userId: 1, path: '/test1', method: 'GET' },
        { userId: 2, path: '/test2', method: 'POST' },
      ];

      analyticsService.getActivities.mockReturnValue(mockActivities);

      analyticsController.getActivities(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockActivities,
      });
    });
  });

  describe('getUserEngagement', () => {
    it('should return user engagement metrics', async () => {
      const mockEngagement = {
        dailyActiveUsers: 100,
        monthlyActiveUsers: 500,
        userSignups: 25,
      };

      analyticsService.getUserEngagement.mockResolvedValue(mockEngagement);

      await analyticsController.getUserEngagement(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockEngagement,
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      analyticsService.getUserEngagement.mockRejectedValue(error);

      await analyticsController.getUserEngagement(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('getCoursePopularity', () => {
    it('should return course popularity data', async () => {
      const mockPopularity = [
        { courseId: 1, courseName: 'Course 1', enrollments: 100 },
        { courseId: 2, courseName: 'Course 2', enrollments: 75 },
      ];

      analyticsService.getCoursePopularity.mockResolvedValue(mockPopularity);

      await analyticsController.getCoursePopularity(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPopularity,
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      analyticsService.getCoursePopularity.mockRejectedValue(error);

      await analyticsController.getCoursePopularity(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });

  describe('getRevenueAnalytics', () => {
    it('should return revenue analytics', async () => {
      const mockRevenue = {
        totalRevenue: 50000,
        monthlyRevenue: 5000,
        averageRevenuePerUser: 100,
      };

      analyticsService.getRevenueAnalytics.mockResolvedValue(mockRevenue);

      await analyticsController.getRevenueAnalytics(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRevenue,
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Calculation error');
      analyticsService.getRevenueAnalytics.mockRejectedValue(error);

      await analyticsController.getRevenueAnalytics(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Calculation error',
      });
    });
  });

  describe('getDashboardStats', () => {
    it('should return combined dashboard statistics', async () => {
      const mockEngagement = { dailyActiveUsers: 100 };
      const mockPopularity = [{ courseId: 1, enrollments: 50 }];
      const mockRevenue = { totalRevenue: 10000 };

      analyticsService.getUserEngagement.mockResolvedValue(mockEngagement);
      analyticsService.getCoursePopularity.mockResolvedValue(mockPopularity);
      analyticsService.getRevenueAnalytics.mockResolvedValue(mockRevenue);

      await analyticsController.getDashboardStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          engagement: mockEngagement,
          popularity: mockPopularity,
          revenue: mockRevenue,
        },
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Service unavailable');
      analyticsService.getUserEngagement.mockRejectedValue(error);

      await analyticsController.getDashboardStats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Service unavailable',
      });
    });
  });

  describe('exportEnrollmentReport', () => {
    it('should export enrollment report as JSON by default', async () => {
      const mockData = [{ enrollmentId: 1, user: 'John Doe' }];
      const mockFilePath = '/path/to/enrollment_report.json';

      reportingService.generateEnrollmentReport.mockResolvedValue(mockData);
      reportingService.exportReportToFile.mockResolvedValue(mockFilePath);

      await analyticsController.exportEnrollmentReport(req, res);

      expect(reportingService.generateEnrollmentReport).toHaveBeenCalled();
      expect(reportingService.exportReportToFile).toHaveBeenCalledWith(
        mockData,
        'enrollment_report.json',
        'json'
      );
      expect(res.download).toHaveBeenCalledWith(mockFilePath);
    });

    it('should export enrollment report as CSV when specified', async () => {
      req.query.format = 'csv';
      const mockData = [{ enrollmentId: 1, user: 'John Doe' }];
      const mockFilePath = '/path/to/enrollment_report.csv';

      reportingService.generateEnrollmentReport.mockResolvedValue(mockData);
      reportingService.exportReportToFile.mockResolvedValue(mockFilePath);

      await analyticsController.exportEnrollmentReport(req, res);

      expect(reportingService.exportReportToFile).toHaveBeenCalledWith(
        mockData,
        'enrollment_report.csv',
        'csv'
      );
    });

    it('should handle errors', async () => {
      const error = new Error('Export failed');
      reportingService.generateEnrollmentReport.mockRejectedValue(error);

      await analyticsController.exportEnrollmentReport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Export failed',
      });
    });
  });

  describe('exportRevenueReport', () => {
    it('should export revenue report', async () => {
      const mockData = [{ paymentId: 1, amount: 100 }];
      const mockFilePath = '/path/to/revenue_report.json';

      reportingService.generateRevenueReport.mockResolvedValue(mockData);
      reportingService.exportReportToFile.mockResolvedValue(mockFilePath);

      await analyticsController.exportRevenueReport(req, res);

      expect(res.download).toHaveBeenCalledWith(mockFilePath);
    });
  });

  describe('customReport', () => {
    it('should generate enrollment custom report', async () => {
      req.query = {
        type: 'enrollment',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        format: 'json',
      };

      const mockData = [{ enrollmentId: 1 }];
      const mockFilePath = '/path/to/custom_enrollment_report.json';

      reportingService.generateEnrollmentReport.mockResolvedValue(mockData);
      reportingService.exportReportToFile.mockResolvedValue(mockFilePath);

      await analyticsController.customReport(req, res);

      expect(reportingService.generateEnrollmentReport).toHaveBeenCalledWith({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });
      expect(res.download).toHaveBeenCalledWith(mockFilePath);
    });

    it('should generate revenue custom report', async () => {
      req.query = {
        type: 'revenue',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const mockData = [{ paymentId: 1 }];
      const mockFilePath = '/path/to/custom_revenue_report.json';

      reportingService.generateRevenueReport.mockResolvedValue(mockData);
      reportingService.exportReportToFile.mockResolvedValue(mockFilePath);

      await analyticsController.customReport(req, res);

      expect(res.download).toHaveBeenCalledWith(mockFilePath);
    });

    it('should generate user-activity custom report', async () => {
      req.query = {
        type: 'user-activity',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const mockData = { totalEnrollments: 100, completions: 50 };
      const mockFilePath = '/path/to/custom_user_activity_report.json';

      reportingService.generateUserActivityReport.mockResolvedValue(mockData);
      reportingService.exportReportToFile.mockResolvedValue(mockFilePath);

      await analyticsController.customReport(req, res);

      expect(res.download).toHaveBeenCalledWith(mockFilePath);
    });

    it('should return error for invalid report type', async () => {
      req.query = { type: 'invalid' };

      await analyticsController.customReport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid report type',
      });
    });

    it('should handle errors during report generation', async () => {
      req.query = { type: 'enrollment' };
      const error = new Error('Generation failed');

      reportingService.generateEnrollmentReport.mockRejectedValue(error);

      await analyticsController.customReport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Generation failed',
      });
    });
  });
});