const { db, admin } = require('../firebaseAdmin');
const { ValidationError } = require('../utils/errorHandler');

class Calendar {
    /**
     * @description Creates a new calendar for a user.
     * @param {string} ownerId - The ID of the user who owns the calendar.
     * @param {string} name - The name of the calendar.
     * @param {string} type - The type of the calendar (e.g., personal, team).
     * @returns {Object} The created calendar data including its ID.
     * @throws {ValidationError} If there is an error while creating the calendar.
     */
    static async createCalendar(ownerId, name, type) {
        const calendarData = {
            ownerId,
            name,
            type,
            createdAt: new Date(),
            events: [], // Initialize events array for storing event references
            members: [] // Initialize members array for storing user references
        };

        try {
            const calendarRef = await db.collection('calendars').add(calendarData);
            return { id: calendarRef.id, ...calendarData };
        } catch (error) {
            throw new ValidationError('Error creating calendar: ' + error.message);
        }
    }

    /**
     * @description Retrieves all calendars for a specific user.
     * @param {string} userId - The ID of the user whose calendars are being retrieved.
     * @returns {Array<Object>} An array of the user's calendar data.
     * @throws {ValidationError} If there is an error while fetching the user's calendars.
     */
    static async getUserCalendars(userId) {
        try {
            const calendarsSnapshot = await db.collection('calendars')
                .where('ownerId', '==', userId)
                .get();
            return calendarsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new ValidationError('Error fetching user calendars: ' + error.message);
        }
    }

    /**
     * @description Links an event to a specific calendar by adding the event ID to the calendar's events list.
     * @param {string} calendarId - The ID of the calendar.
     * @param {string} eventId - The ID of the event to be added to the calendar.
     * @returns {Object} A message indicating the event was linked to the calendar.
     * @throws {ValidationError} If there is an error while adding the event to the calendar.
     */
    static async addEventToCalendar(calendarId, eventId) {
        try {
            const calendarRef = db.collection('calendars').doc(calendarId);
            await calendarRef.update({
                events: admin.firestore.FieldValue.arrayUnion(`events/${eventId}`)
            });
            return { message: 'Event linked to calendar' };
        } catch (error) {
            throw new ValidationError('Error adding event to calendar: ' + error.message);
        }
    }

    /**
     * @description Adds a user to a calendar's group by adding the user ID to the calendar's members list.
     * @param {string} calendarId - The ID of the calendar.
     * @param {string} userId - The ID of the user to be added to the calendar group.
     * @returns {Object} A message indicating the user was added to the calendar group.
     * @throws {ValidationError} If there is an error while adding the user to the calendar group.
     */
    static async addUserToGroup(calendarId, userId) {
        try {
            const calendarRef = db.collection('calendars').doc(calendarId);
            await calendarRef.update({
                members: admin.firestore.FieldValue.arrayUnion(userId)
            });
            return { message: 'User added to calendar group' };
        } catch (error) {
            throw new ValidationError('Error adding user to calendar group: ' + error.message);
        }
    }
    /**
    * Retrieves a calendar for a user based on the specified calendar type.
    * This method is flexible, allowing retrieval of any type of calendar (e.g., "individual", "group").
    *
    * @param {string} ownerId - The ID of the calendar owner (user).
    * @param {string} type - The type of calendar to retrieve (e.g., "individual", "group").
    * @returns {Promise<Object>} The calendar data if found, including its ID.
    * @throws {ValidationError} If no calendar is found for the given type or if an error occurs.
    */
    static async getCalendarByType(ownerId, type) {
        try {
            const calendarsSnapshot = await db.collection('calendars')
                .where('ownerId', '==', ownerId)
                .where('type', '==', type)
                .limit(1)
                .get();

            if (calendarsSnapshot.empty) {
                throw new ValidationError(`No ${type} calendar found for user.`);
            }

            const calendarDoc = calendarsSnapshot.docs[0];
            return { id: calendarDoc.id, ...calendarDoc.data() };
        } catch (error) {
            throw new ValidationError('Error retrieving calendar: ' + error.message);
        }
    }

     /**
     * @description Fetches a calendar by its ID.
     * @param {string} calendarId - The ID of the calendar to retrieve.
     * @returns {Object} The calendar document data.
     * @throws {ValidationError} If the calendar is not found.
     */
    static async getCalendarById(calendarId) {
        const calendarDoc = await db.collection('calendars').doc(calendarId).get();

        if (!calendarDoc.exists) {
            throw new ValidationError('Calendar not found');
        }

        return calendarDoc.data();
    }
    
}

module.exports = Calendar;
