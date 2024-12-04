const Notification = require('../models/notificationModel');
const { ValidationError } = require('../utils/errorHandler');

class NotificationController {
    /**
     * @description Marks a notification as seen
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @returns {Object} JSON with success message
     */
    static async markNotificationAsSeen(req, res, next) {
        const { notificationId } = req.params;

        try {
            const response = await Notification.markNotificationAsSeen(notificationId);
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = NotificationController;
