
const dataProcessingService = require('./dataProcessingService');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { Op } = require('sequelize');

// In-memory for demo; replace with DB in production
const activities = [];
const sessions = [];

const logActivity = (activity) => {
  activities.push(activity);
  // Persist to DB or queue in production
  dataProcessingService.processActivity(activity);
};

const logSessionStart = (session) => {
  sessions.push({ ...session, type: 'start' });
};

const logSessionEnd = (session) => {
  sessions.push({ ...session, type: 'end' });
};

const getActivities = () => activities;

// Real user engagement: daily/monthly active users, signups
const getUserEngagement = async () => {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const dailyActive = new Set(activities.filter(a => a.timestamp && new Date(a.timestamp) > dayAgo && a.userId).map(a => a.userId));
  const monthlyActive = new Set(activities.filter(a => a.timestamp && new Date(a.timestamp) > monthAgo && a.userId).map(a => a.userId));
  const userSignups = await User.count({ where: { createdAt: { [Op.gte]: dayAgo } } });
  return {
    dailyActiveUsers: dailyActive.size,
    monthlyActiveUsers: monthlyActive.size,
    userSignups,
  };
};

// Real course popularity: top courses by enrollments
const getCoursePopularity = async () => {
  const enrollments = await Enrollment.findAll({
    attributes: ['courseId', [require('sequelize').fn('COUNT', require('sequelize').col('courseId')), 'enrollments']],
    group: ['courseId'],
    order: [[require('sequelize').fn('COUNT', require('sequelize').col('courseId')), 'DESC']],
    include: [{ model: Course, as: 'course', attributes: ['title'] }],
    limit: 10,
  });
  return enrollments.map(e => ({
    courseId: e.courseId,
    courseName: e.course ? e.course.title : null,
    enrollments: e.get('enrollments'),
  }));
};

// Real revenue analytics: total, monthly, ARPU
const getRevenueAnalytics = async () => {
  const totalRevenue = await Payment.sum('amount', { where: { status: 'succeeded' } });
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const monthlyRevenue = await Payment.sum('amount', { where: { status: 'succeeded', paidAt: { [Op.gte]: monthAgo } } });
  const userCount = await User.count();
  return {
    totalRevenue: totalRevenue || 0,
    monthlyRevenue: monthlyRevenue || 0,
    averageRevenuePerUser: userCount ? (totalRevenue || 0) / userCount : 0,
  };
};

module.exports = {
  logActivity,
  logSessionStart,
  logSessionEnd,
  getActivities,
  getUserEngagement,
  getCoursePopularity,
  getRevenueAnalytics,
};
