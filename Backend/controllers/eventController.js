const Event = require('../models/eventModel');
const { ValidationError } = require('../utils/errorHandler');
const Calendar = require('../models/calendarModel');
const Notification = require("../models/notificationModel");

class EventController {
    /**
     * @description Creates an event in a specified calendar.
     * @param {Object} req - Express request object, expects `calendarId` in params and `title`, `date`, `location`, and `description` in body.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Object} JSON with success message and created event details.
     */
    static async createEvent(req, res, next) {
        console.log('Params:', req.params);
        console.log('Body:', req.body);
    
        const { calendarId } = req.params;
        const { title, startDate, endDate, location, description, type } = req.body;
        const userId = req.user.uid;
        const members = [];
    
        if (!title || !startDate || !endDate || !type) {
            return res.status(400).json({ error: 'Title, startDate, endDate, location, type, and description are required' });
        }
    
        try {
            // Check if the calendar exists
            const calendar = await Calendar.getCalendarById(calendarId);
            if (!calendar) {
                return res.status(404).json({ error: 'Calendar not found' });
            }
    
            // Ensure the user has access to the calendar
            if (calendar.ownerId !== userId && !calendar.members.includes(userId)) {
                return res.status(403).json({ error: 'You do not have permission to add events to this calendar' });
            }
    
            // Create the event
            const eventData = { title, startDate, endDate, location, description, calendarId, createdBy: userId, type, members };
            const event = await Event.createEvent(eventData);
    
            // Add the event to the calendar
            await Calendar.addEventToCalendar(calendarId, event.id);
    
            res.status(201).json({ message: 'Event created successfully', event });
        } catch (error) {
            console.error('Error in createEvent:', error.message);
            next(error);
        }
    }     
    /**
     * @description Retrieves all events.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Object} JSON with an array of events.
     */
    static async getAllEvents(req, res, next) {
        try {
            const events = await Event.getAll();
            res.status(200).json(events);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Retrieves a specific event by ID.
     * @param {Object} req - Express request object, expects `eventId` in params.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Object} JSON with event details.
     */
    static async getEventById(req, res, next) {
        const { eventId } = req.params;

        console.log('Fetching event with ID:', eventId);

        if (!eventId) {
            return res.status(400).json({ error: 'Event ID is required' });
        }

        try {
            const event = await Event.getById(eventId);
            res.status(200).json(event);
        } catch (error) {
            console.error(`Error in getEventById: ${error.message}`);
            next(new ValidationError(`Error fetching event: ${error.message}`));
        }
    }

    /**
     * @description Updates a specific event by ID.
     * @param {Object} req - Express request object, expects `eventId` in params and updated event data in body.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Object} JSON with success message and updated event details.
     */
    static async updateEvent(req, res, next) {
        const { eventId } = req.params;
        const updatedData = req.body;

        try {
            const updatedEvent = await Event.update(eventId, updatedData);
            res.status(200).json({ message: 'Event updated successfully', updatedEvent });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Deletes a specific event by ID.
     * @param {Object} req - Express request object, expects `eventId` in params.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Object} JSON with success message.
     */
    static async deleteEvent(req, res, next) {
        const { eventId } = req.params;

        try {
            await Event.delete(eventId);
            res.status(200).json({ message: 'Event deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

      /**
         * @description Adds a reminder to an event and creates a notification.
         * @param {Object} req - Express request object.
         * @param {Object} res - Express response object.
         * @param {Function} next - Express next middleware function.
         */
      static async addReminder(req, res, next) {
        const { eventId } = req.params;
        const { userId, message, time } = req.body;
        console.log("test 123");
        
        if (!message || !time || !userId) {
            return next(new ValidationError('Reminder must include userId, message, and time.'));
        }

        try {
            // Step 1: Add the reminder to the event
            const reminder = { userId, message, time };
            const response = await Event.addReminder(eventId, reminder);

            // Step 2: Create a notification for the reminder
            const notificationData = {
                userId: reminder.userId,
                type: 'reminder',
                message: `You have a reminder for ${reminder.time}, message : ${reminder.message}`,
                status: 'unseen',
                dueTime: new Date(reminder.time),
                eventId: eventId,
                createdAt: new Date(),
            };

            const notification = await Notification.create(notificationData);

            // Step 3: Add the notification ID to the user's notifications document
            await Notification.addNotification(userId, { ...notification });

            res.status(200).json({
                message: 'Reminder added successfully and notification created',
                reminder,
                notification: notificationData,
            });
        } catch (error) {
            console.error('Error adding reminder:', error.message);
            next(new ValidationError('Error adding reminder: ' + error.message));
        }
    }



    

    /**
     * @description Retrieves all reminders for a specific event.
     * @param {Object} req - Express request object, expects `eventId` in params.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Object} JSON with an array of reminders for the event.
     */
    static async getReminders(req, res, next) {
        const { eventId } = req.params;

        try {
            const reminders = await Event.getReminders(eventId);
            res.status(200).json(reminders);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Retrieves reminders due within a specific timeframe for the authenticated user.
     * @param {Object} req - Express request object, expects `timeframe` in query.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Object} JSON with an array of reminders due within the specified timeframe.
     */
    static async getRemindersDue(req, res, next) {
        const userId = req.user.uid;
        const { timeframe } = req.query;

        if (!timeframe) {
            return next(new ValidationError('Timeframe is required'));
        }

        try {
            const reminders = await Event.getRemindersByDueDate(userId, parseInt(timeframe));
            res.status(200).json(reminders);
        } catch (error) {
            next(error);
        }
    }
    /**
     * Gets all events for a specific calendar.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {void}
     */
    /**
     * Gets all events for a specific calendar.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {void}
     */
    static async getEventsByCalendarId(req, res, next) {
        const { calendarId } = req.params;

        console.log('Fetching events for calendar ID:', calendarId);

        if (!calendarId) {
            return res.status(400).json({ error: 'Calendar ID is required' });
        }

        try {
            const events = await Event.getEventsByCalendarId(calendarId);
            /*
            if (events.length === 0) {
                return res.status(200).json({events: [] });
            }*/

            res.status(200).json(events);
        } catch (error) {
            console.error(`Error in getEventsByCalendarId: ${error.message}`);
            next(new ValidationError(`Error fetching events for calendar: ${error.message}`));
        }
    }

    /**
     * Deletes an event by its ID.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {void}
     */
    static async deleteEvent(req, res, next) {
        const { eventId } = req.params;

        try {
            await Event.delete(eventId);
            res.status(200).json({ message: 'Event deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Toggles the visibility (`show` property) of an event.
     * @param {Object} req - Express request object, expects `eventId` in params and `show` in body.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Object} JSON response with the updated event.
     */
    static async toggleEventVisibility(req, res, next) {
        const { eventId } = req.params;
        const { show } = req.body;

        if (typeof show !== 'boolean') {
            return res.status(400).json({ error: 'Invalid value for "show". Must be true or false.' });
        }

        try {
            const updatedEvent = await Event.updateEventVisibility(eventId, show);
            res.status(200).json({ message: 'Event visibility updated', event: updatedEvent });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = EventController;
