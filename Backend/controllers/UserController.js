const User = require('../models/userModel');
const Calendar = require('../models/calendarModel');
const Notification = require('../models/notificationModel');
const { ValidationError, UnauthorizedError } = require('../utils/errorHandler');
const { generateToken } = require('../middlewares/jwtHelper');
const bcrypt = require('bcrypt');



class UserController {
    /**
     * @description Registers a new user and creates a default calendar for them.
     * @route POST /api/users/register
     * @param {Object} req - Express request object, expects `email`, `password`, and `name` in body.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Object} JSON with success message, user, and calendar data.
     */
    static async registerUser(req, res, next) {
        const { email, password, name } = req.body;
    
        if (!email || !password || !name) {
            return next(new ValidationError('Email, password, and name are required'));
        }
    
        try {
            const { nanoid } = await import('nanoid');
            const shortId = nanoid(8);

            const hashedPassword = await bcrypt.hash(password, 10);
    
            const userData = {
                email,
                password: hashedPassword,
                name,
                shortId,
                friendRequests: [],
                invitations:[],
                groupRequests: [],
                friends: [],
                groups:[],
                createdAt: new Date(),
                notificationId: null

            };
            // Create the user and related documents
            const user = await User.createUser(userData);
            const notification = await Notification.init(user.id);
            const calendar = await Calendar.createCalendar(user.id, `${name}'s Calendar`, 'personal');

            // Update user document with notification ID if needed
            await User.updateUser(user.id, { notificationId: notification.id });
    
            res.status(201).json({
                message: 'User registered successfully',
                user,
                calendar,
                notification
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Logs in a user and returns a JWT token.
     * @route POST /api/users/login
     * @param {Object} req - Express request object, expects `email` and `password` in body.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Object} JSON with success message and JWT token.
     */
    static async loginUser(req, res, next) {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ValidationError('Email and password are required'));
        }

        try {
            const user = await User.login(email, password);
            if (!user) {
                return next(new UnauthorizedError('Invalid email or password'));
            }

            const token = generateToken({ uid: user.id, email: user.email });
            res.status(200).json({ message: 'User logged in successfully', token });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Fetches a user's public profile by their ID.
     * @route GET /api/users/profile/:id
     * @param {Object} req - Express request object, expects `id` in params.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Object} JSON with user's public profile data.
     */
    static async getPublicUserProfile(req, res, next) {
        const userId = req.params.id;

        try {
            const userDoc = await User.getPublicProfileById(userId);
            if (!userDoc) {
                return res.status(404).json({ message: 'User not found' });
            }

            const publicProfile = {
                id: userId,
                name: userDoc.name,
                email: userDoc.email,
                profilePic: userDoc.profilePic || null,
                yearOfBirth: userDoc.yearOfBirth || null,
            };

            res.status(200).json(publicProfile);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Retrieves the authenticated user's own profile details.
     * @route GET /api/users/profile
     * @param {Object} req - Express request object, requires user authentication.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Object} JSON with user's own profile data.
     *//*
    static async getUserProfile(req, res, next) {
        const userId = req.user.uid;

        try {
            const userDoc = await User.getById(userId);
            if (!userDoc) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(userDoc);
        } catch (error) {
            next(error);
        }
    }*/

    /**
     * @description Updates the authenticated user's own profile.
     * @route PUT /api/users/profile
     * @param {Object} req - Express request object, requires user authentication and updated profile data in body.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Object} JSON with success message and updated user data.
     */
    static async updateUserProfile(req, res, next) {
        const userId = req.user.uid;
        const updatedData = req.body;

        try {
            const updatedUser = await User.updateUser(userId, updatedData);
            res.status(200).json({ message: 'Profile updated successfully', updatedUser });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Deletes the authenticated user's own account.
     * @route DELETE /api/users/account
     * @param {Object} req - Express request object, requires user authentication.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Object} JSON with success message indicating account deletion.
     */
    static async deleteUserAccount(req, res, next) {
        const userId = req.user.uid;

        try {
            await User.deleteUser(userId);
            res.status(200).json({ message: 'Account deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

     /**
     * Gets the friend list of the authenticated user.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {void}
     */
     static async getFriendList(req, res, next) {
        const userId = req.user.uid;

        try {
            const friends = await User.getFriends(userId);
            res.status(200).json({ friends });
        } catch (error) {
            next(error);
        }
    }
    static async getInvitations(req,res, next){
        const userId = req.user.uid

        try{

            const invitaions = await User.getInvitationsIds(userId);
            res.status(200).json({ invitaions });

        }catch(error){
            next(error);
        }
    }
    static async getGroups(req,res, next){
        const userId = req.user.uid

        try{

            const groups = await User.getGroups(userId);
            res.status(200).json({ groups });

        }catch(error){
            next(error);
        }
    }

    /**
    * @description Retrieves a user's personal calendar by their ID.
    * @param {Object} req - Express request object, expects user ID in params.
    * @param {Object} res - Express response object.
    * @param {Function} next - Express next middleware function.
    * @returns {Object} JSON with the personal calendar ID if found.
    */
    static async getUserPersonalCalendar(req, res, next) {
        const userId = req.params.id;
    
        try {
            const calendar = await Calendar.getCalendarByType(userId, 'personal');
            if (!calendar) {
                return res.status(404).json({ error: 'Personal calendar not found for this user.' });
            }
            res.status(200).json({ calendarId: calendar.id });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    }
  static async getNotifications(req, res, next) {
        const { id } = req.params; // User ID
        /*
        const { type } = req.body; // Type from request body: "unseen" or "all"
    
        if (!type || (type !== 'unseen' && type !== 'all')) {
            return res.status(400).json({ error: 'Invalid type. Must be "unseen" or "all".' });
        }*/
    
        try {
            // Fetch notifications based on type
            const notifications = await Notification.getNotifications(id, "unseen");
    
            res.status(200).json({ notifications });
        } catch (error) {
            next(error);
        }
    }
    /**
     * @description Gets all public events for a specific user based on the `show` property.
     * @param {Object} req - Express request object, expects `userId` in params.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Object} JSON response with public events or an error message.
     */
    static async getPublicEvents(req, res, next) {
        const { userId } = req.params;

        try {
            const events = await User.getPublicEvents(userId);
            res.status(200).json({ events });
        } catch (error) {
            next(error);
        }
    }
    /**
    * @description Search users by name (case-insensitive partial match).
    * @route GET /api/users/search
    * @param {Object} req - Express request object, expects `name` in query.
    * @param {Object} res - Express response object.
    * @param {Function} next - Express next middleware function.
    * @returns {Object} JSON array of user profiles matching the search criteria.
    */
    static async searchUsersByName(req, res, next) {
       const { name } = req.query;

       if (!name) {
           return res.status(400).json({ error: 'Name query parameter is required' });
       }

       try {
           const users = await User.searchByName(name);
           res.status(200).json(users);
       } catch (error) {
           next(error);
       }
    }

}

module.exports = UserController;
