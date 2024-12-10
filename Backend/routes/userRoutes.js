const express = require('express');
const UserController = require('../controllers/UserController');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/userModel');

/**
 * @route POST /api/users/register
 * @description Register a new user with email, password, and name
 * @access Public
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "userPassword",
 *   "name": "User Name"
 * }
 * 
 * Response:
 * - Success: Status 201 with message, user details, and a default calendar.
 * - Error: Status 400 or 500 with error details if registration fails.
 */
router.post('/register', UserController.registerUser);

/**
 * @route POST /api/users/login
 * @description Authenticate a user and return a JWT token
 * @access Public
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "userPassword"
 * }
 * 
 * Response:
 * - Success: Status 200 with a message and JWT token.
 * - Error: Status 400 or 401 with error details if authentication fails.
 */
router.post('/login', UserController.loginUser);

/**
 * @route GET /api/users/profile/:id
 * @description Fetch the public profile of a user by their ID
 * @access Public
 * 
 * URL Params:
 * - :id - The user ID of the profile to fetch
 * 
 * Response:
 * - Success: Status 200 with public profile information (e.g., name, email, profilePic).
 * - Error: Status 404 or 500 with error details if the user is not found or other issues occur.
 */
router.get('/profile/:id', UserController.getPublicUserProfile);

/**
 * @route GET /api/users/:id
 * @description Retrieve the profile details of the currently authenticated user
 * @access Protected - requires user authentication
 * 
 * Response:
 * - Success: Status 200 with the authenticated user's profile details.
 * - Error: Status 401 or 500 with error details if the user is not authenticated or if an issue occurs.
 */
//router.get('/:id', UserController.getUserProfile);

/**
 * @route PUT /api/users/profile
 * @description Update the profile details of the currently authenticated user
 * @access Protected - requires user authentication
 * 
 * Request Body:
 * {
 *   "name": "Updated Name",
 *   "profilePic": "http://example.com/profile.jpg",
 *   "yearOfBirth": 1990,
 *   "occupation": "Developer"
 * }
 * 
 * Response:
 * - Success: Status 200 with a message and the updated profile data.
 * - Error: Status 400 or 500 with error details if validation or updating fails.
 */
router.put('/profile', authMiddleware, UserController.updateUserProfile);

/**
 * @route DELETE /api/users/account
 * @description Delete the currently authenticated user's account
 * @access Protected - requires user authentication
 * 
 * Response:
 * - Success: Status 200 with a message indicating successful account deletion.
 * - Error: Status 401 or 500 with error details if the user is not authenticated or deletion fails.
 */
router.delete('/account', authMiddleware, UserController.deleteUserAccount);

/**
 * @route GET /api/users/friends
 * @description Retrieves the friend list of the authenticated user
 * @access Protected - requires user authentication
 * 
 * Response:
 * - Success: Status 200 with an array of friend IDs
 * - Error: Status 401 or 500 with error details if authentication fails or an error occurs
 */
router.get('/friends', authMiddleware, UserController.getFriendList);



//MISSING TODO COMMENT OR INFO
router.get('/groups',authMiddleware,UserController.getGroups);



// Getting the group invitations
router.get('/invitations',authMiddleware,UserController.getInvitations);



/**
 * @route GET /api/users/id
 * @description Retrieves the authenticated user's ID.
 * @access Protected - requires user authentication
 */
router.get('/id', authMiddleware, (req, res) => {
    res.status(200).json({ userId: req.user.uid });
});

/**
 * @route GET /api/users/:id/calendar
 * @description Retrieve the personal calendar ID of a specific user by their ID
 * @access Protected - requires user authentication
 * 
 * Response:
 * - Success: Status 200 with the personal calendar ID.
 * - Error: Status 400 or 500 with error details if there was an issue.
 */
router.get('/:id/calendar', authMiddleware, UserController.getUserPersonalCalendar);


/**
 * @route GET /api/users/:id/notifications
 * @description Retrieve the notifications of a specific user by their ID
 * @access Protected - requires user authentication
 * 
 */

router.get('/:id/notifications', authMiddleware, UserController.getNotifications);

/**
 * @route GET /api/users/:userId/public-events
 * @description Fetch all public events for a user based on the `show` property.
 * @access Public - does not requires user authentication
 */
router.get('/:id/public-events', UserController.getPublicEvents);



/**
 * @route GET /api/users/profile/:id
 * @description Fetch the public profile of a user by their ID
 * @access Public - does not requires user authentication
 * 
 * URL Params:
 * - :id - The user ID of the profile to fetch
 * 
 * Response:
 * - Success: Status 200 with public profile information (e.g., name, email, profilePic).
 * - Error: Status 404 or 500 with error details if the user is not found or other issues occur.
 */
router.get('/profile/:id', UserController.getPublicUserProfile);

/**
 * @route GET /api/users/search
 * @description Search users by name
 * @access Protected - requires user authentication
 */
router.get('/search', UserController.searchUsersByName);

module.exports = router;
