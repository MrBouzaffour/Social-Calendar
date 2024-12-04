const express = require('express');
const NotificationController = require('../controllers/NotificationController');
const router = express.Router();

/**
 * @route PATCH /api/notifications/:notificationId
 * @description Mark a notification as seen
 * @access Protected - requires user authentication
 */
router.patch('/:notificationId', NotificationController.markNotificationAsSeen);

module.exports = router;
