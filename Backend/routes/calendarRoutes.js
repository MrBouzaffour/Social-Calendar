const express = require('express');
const CalendarController = require('../controllers/calendarController');
const EventController = require('../controllers/eventController');

const router = express.Router();

/**
 * CALENDAR ROUTES
 */

// Create a new calendar
router.post('/', CalendarController.createCalendar);

// Retrieve all calendars for the authenticated user
router.get('/', CalendarController.getUserCalendars);

// Retrieve a calendar by type
router.get('/type', CalendarController.getUserCalendarByType);

// Add a user to a calendar group
router.post('/:calendarId/members', CalendarController.addUserToCalendarGroup);

/**
 * EVENT ROUTES (Nested under Calendars)
 */


// Create a new event in a specific calendar
router.post('/:calendarId/events', EventController.createEvent);

// Retrieve all events for a specific calendar
router.get('/:calendarId/events', EventController.getEventsByCalendarId);

// Retrieve the details of a specific event
router.get('/:calendarId/events/:eventId', EventController.getEventById);

// Update a specific event
router.put('/:calendarId/events/:eventId', EventController.updateEvent);

// Delete a specific event
router.delete('/:calendarId/events/:eventId', EventController.deleteEvent);

/**
 * @route PATCH /api/events/:eventId/visibility
 * @description Toggle the visibility (`show`) of an event.
 * @access Protected - requires user authentication
 * {
    "show": true
    }
 */
//router.patch('/:calendarId/events/:eventId/visibility', authMiddleware, EventController.toggleEventVisibility);

// Add a reminder to a specific event
router.post('/:calendarId/events/:eventId/reminders', EventController.addReminder);

// Retrieve all reminders for a specific event
router.get('/:calendarId/events/:eventId/reminders', EventController.getReminders);

module.exports = router;
