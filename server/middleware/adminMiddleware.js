/**
 * Middleware to check if the authenticated user has admin privileges
 */
const adminMiddleware = (req, res, next) => {
    // Check if user exists and has admin role
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

module.exports = adminMiddleware;
