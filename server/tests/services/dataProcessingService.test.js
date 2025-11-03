const dataProcessingService = require('../../services/dataProcessingService');
const reportingService = require('../../services/reportingService');

jest.mock('../../services/reportingService');

describe('Data Processing Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log to avoid cluttering test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('processActivity', () => {
    it('should log activity processing', () => {
      const activity = {
        userId: 1,
        path: '/courses/1',
        method: 'GET',
      };

      dataProcessingService.processActivity(activity);

      expect(console.log).toHaveBeenCalledWith(
        'Processing activity:',
        activity
      );
    });

    it('should trigger enrollment report for enroll activities', () => {
      const activity = {
        userId: 1,
        path: '/courses/1/enroll',
        method: 'POST',
      };

      dataProcessingService.processActivity(activity);

      expect(reportingService.generateEnrollmentReport).toHaveBeenCalled();
    });

    it('should not trigger reports for non-enroll activities', () => {
      const activity = {
        userId: 1,
        path: '/courses/1/view',
        method: 'GET',
      };

      dataProcessingService.processActivity(activity);

      expect(reportingService.generateEnrollmentReport).not.toHaveBeenCalled();
    });
  });
});