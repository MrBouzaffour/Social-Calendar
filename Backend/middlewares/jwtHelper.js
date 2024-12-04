const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Generates a JWT token with a 1-hour expiration.
 * @param {Object} payload - The payload to encode in the token.
 * @returns {string} The generated JWT token.
 * @throws Will throw an error if `JWT_SECRET` is missing.
 */
function generateToken(payload) {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is missing.');
    }
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Verifies a JWT token and returns the decoded payload.
 * @param {string} token - The JWT token to verify.
 * @returns {Object|null} The decoded payload if valid, or null if invalid or expired.
 */
const verifyToken = (token) => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is missing.');
        }
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return null;
    }
};

module.exports = { generateToken, verifyToken };
