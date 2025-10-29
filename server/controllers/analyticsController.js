// Real-time dashboard data endpoint
const getDashboardStats = async (req, res) => {
  try {
    const [engagement, popularity, revenue] = await Promise.all([
      analyticsService.getUserEngagement(),
      analyticsService.getCoursePopularity(),
      analyticsService.getRevenueAnalytics(),
    ]);
    res.json({
      success: true,
      data: {
        engagement,
        popularity,
        revenue,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Custom report generation endpoint
const customReport = async (req, res) => {
  try {
    const { type, startDate, endDate, format = 'json' } = req.query;
    let data, filePath;
    if (type === 'enrollment') {
      data = await reportingService.generateEnrollmentReport({ startDate, endDate });
      filePath = await reportingService.exportReportToFile(data, `custom_enrollment_report.${format}`, format);
    } else if (type === 'revenue') {
      data = await reportingService.generateRevenueReport({ startDate, endDate });
      filePath = await reportingService.exportReportToFile(data, `custom_revenue_report.${format}`, format);
    } else if (type === 'user-activity') {
      data = await reportingService.generateUserActivityReport({ startDate, endDate });
      filePath = await reportingService.exportReportToFile([data], `custom_user_activity_report.${format}`, format);
    } else {
      return res.status(400).json({ success: false, error: 'Invalid report type' });
    }
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
const analyticsService = require('../services/analyticsService');
const reportingService = require('../services/reportingService');

// Get all tracked activities
const getActivities = (req, res) => {
  const activities = analyticsService.getActivities();
  res.json({ success: true, data: activities });
};

// Get user engagement analytics (async)
const getUserEngagement = async (req, res) => {
  try {
    const engagement = await analyticsService.getUserEngagement();
    res.json({ success: true, data: engagement });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get course popularity analytics (async)
const getCoursePopularity = async (req, res) => {
  try {
    const popularity = await analyticsService.getCoursePopularity();
    res.json({ success: true, data: popularity });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get revenue analytics (async)
const getRevenueAnalytics = async (req, res) => {
  try {
    const revenue = await analyticsService.getRevenueAnalytics();
    res.json({ success: true, data: revenue });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Export enrollment report (JSON or CSV)
const exportEnrollmentReport = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const data = await reportingService.generateEnrollmentReport();
    const filePath = await reportingService.exportReportToFile(data, `enrollment_report.${format}`, format);
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Export revenue report (JSON or CSV)
const exportRevenueReport = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const data = await reportingService.generateRevenueReport();
    const filePath = await reportingService.exportReportToFile(data, `revenue_report.${format}`, format);
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getActivities,
  getUserEngagement,
  getCoursePopularity,
  getRevenueAnalytics,
  exportEnrollmentReport,
  exportRevenueReport,
  getDashboardStats,
  customReport,
};
