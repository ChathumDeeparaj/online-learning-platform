const reportingService = require('../../services/reportingService');
const Enrollment = require('../../models/Enrollment');
const Payment = require('../../models/Payment');
const User = require('../../models/User');
const Course = require('../../models/Course');
const fs = require('fs');
const path = require('path');

jest.mock('../../models/Enrollment');
jest.mock('../../models/Payment');
jest.mock('../../models/User');
jest.mock('../../models/Course');
jest.mock('fs');

describe('Reporting Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateEnrollmentReport', () => {
    it('should generate enrollment report without date filters', async () => {
      const mockEnrollments = [
        {
          id: 1,
          userId: 1,
          courseId: 1,
          enrollmentDate: new Date('2024-01-15'),
          status: 'active',
          progress: 50,
          grade: null,
          paymentStatus: 'paid',
          paymentAmount: 100,
          paymentDate: new Date('2024-01-15'),
          user: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
          course: { id: 1, title: 'Test Course' },
        },
      ];

      Enrollment.findAll.mockResolvedValue(mockEnrollments);

      const result = await reportingService.generateEnrollmentReport();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        enrollmentId: 1,
        user: 'John Doe',
        userId: 1,
        course: 'Test Course',
        courseId: 1,
        enrollmentDate: mockEnrollments[0].enrollmentDate,
        status: 'active',
        progress: 50,
        grade: null,
        paymentStatus: 'paid',
        paymentAmount: 100,
        paymentDate: mockEnrollments[0].paymentDate,
      });
      expect(Enrollment.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        })
      );
    });

    it('should generate enrollment report with date filters', async () => {
      const mockEnrollments = [];
      Enrollment.findAll.mockResolvedValue(mockEnrollments);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      await reportingService.generateEnrollmentReport({ startDate, endDate });

      expect(Enrollment.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            enrollmentDate: expect.objectContaining({
              [require('sequelize').Op.gte]: startDate,
              [require('sequelize').Op.lte]: endDate,
            }),
          },
        })
      );
    });

    it('should handle enrollments without user or course', async () => {
      const mockEnrollments = [
        {
          id: 1,
          userId: 1,
          courseId: 1,
          enrollmentDate: new Date(),
          status: 'active',
          progress: 0,
          grade: null,
          paymentStatus: 'pending',
          paymentAmount: null,
          paymentDate: null,
          user: null,
          course: null,
        },
      ];

      Enrollment.findAll.mockResolvedValue(mockEnrollments);

      const result = await reportingService.generateEnrollmentReport();

      expect(result[0].user).toBeNull();
      expect(result[0].course).toBeNull();
    });
  });

  describe('generateRevenueReport', () => {
    it('should generate revenue report without date filters', async () => {
      const mockPayments = [
        {
          id: 1,
          userId: 1,
          courseId: 1,
          amount: 100,
          currency: 'USD',
          paidAt: new Date('2024-01-15'),
          status: 'succeeded',
          paymentMethod: 'card',
          user: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
          course: { id: 1, title: 'Premium Course' },
        },
      ];

      Payment.findAll.mockResolvedValue(mockPayments);

      const result = await reportingService.generateRevenueReport();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        paymentId: 1,
        user: 'Jane Smith',
        userId: 1,
        course: 'Premium Course',
        courseId: 1,
        amount: 100,
        currency: 'USD',
        paidAt: mockPayments[0].paidAt,
        status: 'succeeded',
        paymentMethod: 'card',
      });
    });

    it('should generate revenue report with date filters', async () => {
      Payment.findAll.mockResolvedValue([]);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      await reportingService.generateRevenueReport({ startDate, endDate });

      expect(Payment.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: 'succeeded',
            paidAt: expect.objectContaining({
              [require('sequelize').Op.gte]: startDate,
              [require('sequelize').Op.lte]: endDate,
            }),
          },
        })
      );
    });

    it('should only include succeeded payments', async () => {
      Payment.findAll.mockResolvedValue([]);

      await reportingService.generateRevenueReport();

      expect(Payment.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'succeeded',
          }),
        })
      );
    });
  });

  describe('generateUserActivityReport', () => {
    it('should calculate enrollment and completion metrics', async () => {
      const mockEnrollments = [
        { id: 1, status: 'completed', enrollmentDate: new Date('2024-01-10') },
        { id: 2, status: 'active', enrollmentDate: new Date('2024-01-11') },
        { id: 3, status: 'completed', enrollmentDate: new Date('2024-01-12') },
        { id: 4, status: 'active', enrollmentDate: new Date('2024-01-13') },
      ];

      Enrollment.findAll.mockResolvedValue(mockEnrollments);

      const result = await reportingService.generateUserActivityReport();

      expect(result).toEqual({
        totalEnrollments: 4,
        completions: 2,
        completionRate: 50,
      });
    });

    it('should handle zero enrollments', async () => {
      Enrollment.findAll.mockResolvedValue([]);

      const result = await reportingService.generateUserActivityReport();

      expect(result).toEqual({
        totalEnrollments: 0,
        completions: 0,
        completionRate: 0,
      });
    });

    it('should filter by date range', async () => {
      Enrollment.findAll.mockResolvedValue([]);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      await reportingService.generateUserActivityReport({ startDate, endDate });

      expect(Enrollment.findAll).toHaveBeenCalledWith({
        where: {
          enrollmentDate: expect.objectContaining({
            [require('sequelize').Op.gte]: startDate,
            [require('sequelize').Op.lte]: endDate,
          }),
        },
      });
    });
  });

  describe('exportReportToFile', () => {
    beforeEach(() => {
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockImplementation(() => {});
      fs.writeFileSync.mockImplementation(() => {});
    });

    it('should create reports directory if it does not exist', async () => {
      fs.existsSync.mockReturnValue(false);

      const data = [{ id: 1, name: 'Test' }];
      await reportingService.exportReportToFile(data, 'test.json', 'json');

      expect(fs.mkdirSync).toHaveBeenCalled();
    });

    it('should export data as JSON', async () => {
      fs.existsSync.mockReturnValue(true);

      const data = [{ id: 1, name: 'Test' }];
      const filePath = await reportingService.exportReportToFile(
        data,
        'test.json',
        'json'
      );

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(filePath).toContain('test.json');
      
      const writeCall = fs.writeFileSync.mock.calls[0][1];
      expect(writeCall).toContain('"id"');
      expect(writeCall).toContain('"name"');
    });

    it('should export data as CSV with headers', async () => {
      fs.existsSync.mockReturnValue(true);

      const data = [
        { id: 1, name: 'Test One', value: 100 },
        { id: 2, name: 'Test Two', value: 200 },
      ];
      const filePath = await reportingService.exportReportToFile(
        data,
        'test.csv',
        'csv'
      );

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(filePath).toContain('test.csv');

      const csvContent = fs.writeFileSync.mock.calls[0][1];
      expect(csvContent).toContain('id,name,value');
      expect(csvContent).toContain('1,"Test One",100');
      expect(csvContent).toContain('2,"Test Two",200');
    });

    it('should handle empty data array for CSV', async () => {
      fs.existsSync.mockReturnValue(true);

      const data = [];
      await reportingService.exportReportToFile(data, 'empty.csv', 'csv');

      const csvContent = fs.writeFileSync.mock.calls[0][1];
      expect(csvContent).toBe('');
    });

    it('should handle null/undefined values in CSV', async () => {
      fs.existsSync.mockReturnValue(true);

      const data = [{ id: 1, name: null, value: undefined }];
      await reportingService.exportReportToFile(data, 'test.csv', 'csv');

      const csvContent = fs.writeFileSync.mock.calls[0][1];
      expect(csvContent).toContain('""');
    });
  });
});