const Calendar = require('../models/calendarModel');
const { ValidationError } = require('../utils/errorHandler');

class CalendarController {
    /**
     * @description Creates a new calendar for the authenticated user.
     * @param {Object} req - Express request object, expects `name` and `type` in the body.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Object} JSON with success message and created calendar details.
     */
    static async createCalendar(req, res, next) {
        console.log('createCalendar called'); // Debug log
        const { name, type } = req.body;
        const ownerId = req.user.uid;

        if (!name || !type) {
            return next(new ValidationError('Name and type are required'));
        }

        try {
            const calendar = await Calendar.createCalendar(ownerId, name, type);
            res.status(201).json({ message: 'Calendar created successfully', calendar });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Retrieves all calendars for the authenticated user.
     * @param {Object} req - Express request object, expects user ID in `req.user`.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Object} JSON with an array of user’s calendars.
     */
    static async getUserCalendars(req, res, next) {
        console.log('getUserCalendars called'); // Debug log
        const userId = req.user.uid;

        try {
            const calendars = await Calendar.getUserCalendars(userId);
            res.status(200).json(calendars);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Adds an event to a specified calendar.
     * @param {Object} req - Express request object, expects `title`, `date`, `location`, and `description` in the body.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Object} JSON with success message, event details, and calendar link confirmation.
     */
    static async addEventToCalendar(req, res, next) {
        const { calendarId } = req.params;
        const { title, startDate ,endDate ,location, description ,type} = req.body; // added startDate,endDate,type
        const userId = req.user?.uid; // Use optional chaining to avoid undefined errors

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!title || !location || !description || !startDate || !endDate || !type) {
            return res.status(400).json({ error: 'Title, startDate, endDate, location, type, and description are required' });
        }


        try {
            const eventData = { title, date, location, description, calendarId, createdBy: userId, show:false };
            const event = await Event.create(eventData);
            const response = await Calendar.addEventToCalendar(calendarId, `events/${event.id}`);

            res.status(201).json({ message: 'Event added to calendar', event, response });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Adds a user to a specified calendar group.
     * @param {Object} req - Express request object, expects `userId` in the body.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Object} JSON with confirmation message of user addition.
     */
    static async addUserToCalendarGroup(req, res, next) {
        console.log('addUserToCalendarGroup called'); // Debug log
        const { calendarId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return next(new ValidationError('User ID is required'));
        }

        try {
            const response = await Calendar.addUserToGroup(calendarId, userId);
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    /**
    * Fetches a calendar associated with the authenticated user based on the specified type.
    * If no type is provided, it defaults to "individual".
    *
    * @async
    * @function getUserCalendarByType
    * @param {Object} req - Express request object.
    * @param {Object} req.user - The authenticated user's data, containing their unique ID.
    * @param {Object} req.query - Query parameters containing the calendar type (e.g., "individual" or "group").
    * @param {Object} res - Express response object.
    * @param {Function} next - Express next middleware function for error handling.
    * @returns {Promise<void>} Sends the calendar data in the response if found.
    * @throws {ValidationError} If no calendar of the specified type is found or if an error occurs.
    */
    static async getUserCalendarByType(req, res, next) {
        const userId = req.user.uid;
        const { type = 'individual' } = req.query; // Default to 'individual' if no type is specified

        try {
            const calendar = await Calendar.getCalendarByType(userId, type);
            res.status(200).json(calendar);
        } catch (error) {
            next(error);
        }
}

}

module.exports = CalendarController;
