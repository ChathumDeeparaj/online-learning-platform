const request = require('supertest');
const express = require('express');
const analyticsRoutes = require('../../routes/analytics');
const { authenticate, authorize } = require('../../middleware/auth');

// Mock authentication middleware
jest.mock('../../middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, role: 'admin' };
    next();
  },
  authorize: (role) => (req, res, next) => next(),
}));

const app = express();
app.use(express.json());
app.use('/api/analytics', analyticsRoutes);

describe('Analytics API Integration Tests', () => {
  describe('GET /api/analytics/dashboard', () => {
    it('should return dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('engagement');
      expect(response.body.data).toHaveProperty('popularity');
      expect(response.body.data).toHaveProperty('revenue');
    });
  });

  describe('GET /api/analytics/user-engagement', () => {
    it('should return user engagement metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/user-engagement')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('dailyActiveUsers');
      expect(response.body.data).toHaveProperty('monthlyActiveUsers');
    });
  });

  describe('GET /api/analytics/custom-report', () => {
    it('should generate custom enrollment report', async () => {
      const response = await request(app)
        .get('/api/analytics/custom-report')
        .query({
          type: 'enrollment',
          format: 'json',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        })
        .expect(200);

      // This will be a file download
      expect(response.headers['content-disposition']).toBeDefined();
    });

    it('should return error for invalid report type', async () => {
      const response = await request(app)
        .get('/api/analytics/custom-report')
        .query({ type: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid report type');
    });
  });
});