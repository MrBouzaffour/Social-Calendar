const { verifyToken } = require('./jwtHelper');

/**
 * Middleware to authenticate requests based on JWT tokens.
 * Checks the Authorization header for a Bearer token and verifies it.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void} - Calls next() if authorized, otherwise sends a 401 response.
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Extracts token after 'Bearer'

    if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = decoded; // Attach decoded user info (e.g., uid) to the request for downstream use
    next();
};

module.exports = authMiddleware;
