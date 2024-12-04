const express = require('express');
const FriendController = require('../controllers/friendController');
const router = express.Router();

/**
 * @route POST /api/friends/request
 * @description Send a friend request to another user
 * @access Protected - requires user authentication
 * 
 * Request Body:
 * {
 *   "receiverId": "<RECEIVER_USER_ID>" // The ID of the user receiving the friend request
 * }
 * 
 * Response:
 * - Success: Status 201 with message and request details if the friend request was sent successfully.
 * - Error: Status 400 or 500 with error details if there was an issue.
 */
router.post('/request', FriendController.sendFriendRequest);

/**
 * @route PUT /api/friends/request/:requestId
 * @description Handle a friend request - accept or reject
 * @access Protected - requires user authentication
 * 
 * URL Parameters:
 * - requestId: The unique ID of the friend request being handled.
 * 
 * Request Body:
 * {
 *   "action": "accept" | "reject" // Action to take on the friend request
 * }
 * 
 * Response:
 * - Success: Status 200 with message if the friend request was accepted or rejected successfully.
 * - Error: Status 400 or 500 with error details if there was an issue.
 */
router.put('/request/:requestId', FriendController.handleFriendRequest);

/**
 * @route GET /api/friends/requests
 * @description Get all pending friend requests for the authenticated user
 * @access Protected - requires user authentication
 * 
 * Response:
 * - Success: Status 200 with a list of pending friend requests if they were retrieved successfully.
 * - Error: Status 400 or 500 with error details if there was an issue.
 */
router.get('/requests', FriendController.getFriendRequests);

module.exports = router;
