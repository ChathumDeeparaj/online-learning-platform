
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { formatDataForExport } = require('../utils/analyticsUtils');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Generate enrollment report (by course, by day)
async function generateEnrollmentReport({ startDate, endDate } = {}) {
  const where = {};
  if (startDate || endDate) {
    where.enrollmentDate = {};
    if (startDate) where.enrollmentDate[Op.gte] = startDate;
    if (endDate) where.enrollmentDate[Op.lte] = endDate;
  }
  const enrollments = await Enrollment.findAll({
    where,
    include: [
      { model: Course, as: 'course', attributes: ['id', 'title'] },
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
    ],
    order: [['enrollmentDate', 'DESC']]
  });
  return enrollments.map(e => ({
    enrollmentId: e.id,
    user: e.user ? `${e.user.firstName} ${e.user.lastName}` : null,
    userId: e.userId,
    course: e.course ? e.course.title : null,
    courseId: e.courseId,
    enrollmentDate: e.enrollmentDate,
    status: e.status,
    progress: e.progress,
    grade: e.grade,
    paymentStatus: e.paymentStatus,
    paymentAmount: e.paymentAmount,
    paymentDate: e.paymentDate,
  }));
}

// Generate revenue report (by course, by month)
async function generateRevenueReport({ startDate, endDate } = {}) {
  const where = { status: 'succeeded' };
  if (startDate || endDate) {
    where.paidAt = {};
    if (startDate) where.paidAt[Op.gte] = startDate;
    if (endDate) where.paidAt[Op.lte] = endDate;
  }
  const payments = await Payment.findAll({
    where,
    include: [
      { model: Course, as: 'course', attributes: ['id', 'title'] },
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
    ],
    order: [['paidAt', 'DESC']]
  });
  return payments.map(p => ({
    paymentId: p.id,
    user: p.user ? `${p.user.firstName} ${p.user.lastName}` : null,
    userId: p.userId,
    course: p.course ? p.course.title : null,
    courseId: p.courseId,
    amount: p.amount,
    currency: p.currency,
    paidAt: p.paidAt,
    status: p.status,
    paymentMethod: p.paymentMethod,
  }));
}

// Generate user activity report (logins, enrollments, completions)
async function generateUserActivityReport({ startDate, endDate } = {}) {
  const where = {};
  if (startDate || endDate) {
    where.enrollmentDate = {};
    if (startDate) where.enrollmentDate[Op.gte] = startDate;
    if (endDate) where.enrollmentDate[Op.lte] = endDate;
  }
  const enrollments = await Enrollment.findAll({ where });
  const totalEnrollments = enrollments.length;
  const completions = enrollments.filter(e => e.status === 'completed').length;
  return {
    totalEnrollments,
    completions,
    completionRate: totalEnrollments ? (completions / totalEnrollments) * 100 : 0,
  };
}

// Export report to file (CSV or JSON)
async function exportReportToFile(data, filename = 'report.json', format = 'json') {
  const reportsDir = path.join(__dirname, '../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  let filePath = path.join(reportsDir, filename);
  let fileData;
  if (format === 'csv') {
    // Simple CSV export
    const keys = data.length ? Object.keys(data[0]) : [];
    const csvRows = [keys.join(',')];
    for (const row of data) {
      csvRows.push(keys.map(k => JSON.stringify(row[k] ?? '')).join(','));
    }
    fileData = csvRows.join('\n');
  } else {
    fileData = formatDataForExport(data);
  }
  fs.writeFileSync(filePath, fileData);
  return filePath;
}

module.exports = {
  generateEnrollmentReport,
  generateRevenueReport,
  generateUserActivityReport,
  exportReportToFile,
};
