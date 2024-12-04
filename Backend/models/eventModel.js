const { db, admin } = require('../firebaseAdmin');
const { ValidationError } = require('../utils/errorHandler');

class Event {


    /**
     * @description Creates a new event.
     * @param {Object} eventData - The data of the event to create.
     * @returns {Object} The created event data including its ID.
     * @throws {ValidationError} If there is an error while creating the event.
     */
    static async createEvent(eventData) {
        try {
            const eventRef = await db.collection('events').add(eventData);
            return { id: eventRef.id, ...eventData };
        } catch (error) {
            throw new ValidationError('Error creating event: ' + error.message);
        }
    }

    /**
     * @description Retrieves an event by its ID.
     * @param {string} eventId - The ID of the event to retrieve.
     * @returns {Object} The event data including its ID.
     * @throws {ValidationError} If the event is not found or there is an error while fetching the event.
     */
    static async getById(eventId) {
        try {
            const eventDoc = await db.collection('events').doc(eventId).get();
            if (!eventDoc.exists) {
                throw new ValidationError('Event not found');
            }
            return { id: eventDoc.id, ...eventDoc.data() };
        } catch (error) {
            throw new ValidationError('Error fetching event');
        }
    }

    /**
     * @description Updates an event's data.
     * @param {string} eventId - The ID of the event to update.
     * @param {Object} updatedData - The data to update in the event.
     * @returns {Object} The updated event data.
     * @throws {ValidationError} If there is an error while updating the event.
     */
    static async update(eventId, updatedData) {
        try {
            await db.collection('events').doc(eventId).update(updatedData);
            return this.getById(eventId);
        } catch (error) {
            throw new ValidationError('Error updating event');
        }
    }

    /**
     * @description Deletes an event.
     * @param {string} eventId - The ID of the event to delete.
     * @throws {ValidationError} If there is an error while deleting the event.
     */
    static async delete(eventId) {
        try {
            await db.collection('events').doc(eventId).delete();
        } catch (error) {
            throw new ValidationError('Error deleting event');
        }
    }

    /**
     * @description Retrieves all events.
     * @returns {Array<Object>} An array of all event data.
     * @throws {ValidationError} If there is an error while fetching events.
     */
    static async getAll() {
        try {
            const snapshot = await db.collection('events').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new ValidationError('Error fetching events');
        }
    }

     /**
         * @description Adds a reminder to an event in Firestore.
         * @param {string} eventId - The ID of the event.
         * @param {Object} reminder - The reminder data.
         * @returns {Object} A message confirming the reminder was added.
         * @throws {ValidationError} If there is an error while adding the reminder.
         */
     static async addReminder(eventId, reminder) {
        try {
            const eventRef = db.collection('events').doc(eventId);
        
            // Add reminder to event
            await eventRef.update({
                reminders: admin.firestore.FieldValue.arrayUnion(reminder),
            });
        
            // Save reminder to scheduledReminders collection
            const reminderData = {
                eventId,
                userId: reminder.userId,
                message: reminder.message,
                dueTime: admin.firestore.Timestamp.fromDate(new Date(reminder.time)),
                status: 'scheduled',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            await db.collection('scheduledReminders').add(reminderData);
        
            return { message: 'Reminder added successfully' };
        } catch (error) {
            console.error('Error in addReminder:', error.message);
            throw new ValidationError('Error adding reminder: ' + error.message);
        }
    }
    /**
     * @description Retrieves reminders for a user within the next 12 hours.
     * @param {string} userId - The ID of the user.
     * @returns {Array<Object>} An array of reminders due in the next 12 hours.
     * @throws {ValidationError} If there is an error while fetching reminders.
     */
    static async getUpcomingReminders(userId) {
    try {
        const now = admin.firestore.Timestamp.now();
        const next12Hours = admin.firestore.Timestamp.fromDate(new Date(now.toDate().getTime() + 12 * 60 * 60 * 1000));

        // Query reminders for the specific user
        const remindersSnapshot = await db.collection('scheduledReminders')
            .where('userId', '==', userId)
            .get();

        // Filter reminders programmatically for the time range
        return remindersSnapshot.docs
            .map(doc => doc.data())
            .filter(reminder => {
                const dueTime = reminder.dueTime.toDate();
                return dueTime >= now.toDate() && dueTime <= next12Hours.toDate();
            })
            .map(filteredReminder => ({
                id: filteredReminder.id,
                type: 'reminder',
                message: `You have an event "${filteredReminder.message}" at ${new Date(filteredReminder.dueTime.toDate()).toLocaleString()}.`,
                status: 'upcoming',
                timestamp: filteredReminder.dueTime.toDate(),
            }));
    } catch (error) {
        console.error('Error fetching upcoming reminders:', error.message);
        throw new ValidationError('Error fetching upcoming reminders: ' + error.message);
    }
}



    /**
     * @description Retrieves reminders for a specific event.
     * @param {string} eventId - The ID of the event.
     * @returns {Array<Object>} An array of reminders for the event.
     * @throws {ValidationError} If the event is not found or there is an error while fetching reminders.
     */
    static async getReminders(eventId) {
        try {
            const eventDoc = await db.collection('events').doc(eventId).get();
            if (!eventDoc.exists) {
                throw new ValidationError('Event not found');
            }
            return eventDoc.data().reminders || [];
        } catch (error) {
            throw new ValidationError('Error fetching reminders');
        }
    }

    

    /**
     * @description Retrieves reminders for a user within a specified timeframe.
     * @param {string} userId - The ID of the user.
     * @param {number} timeframe - The timeframe in milliseconds to fetch reminders within.
     * @returns {Array<Object>} An array of reminders due within the timeframe.
     * @throws {ValidationError} If there is an error while fetching reminders by due date.
     */
    static async getRemindersByDueDate(userId, timeframe) {
        try {
            const now = admin.firestore.Timestamp.now();
            const targetDate = admin.firestore.Timestamp.fromDate(new Date(now.toDate().getTime() + timeframe));

            const eventsSnapshot = await db.collection('events')
                .where('members', 'array-contains', userId)
                .get();

            const remindersDue = [];
            eventsSnapshot.forEach(doc => {
                const event = doc.data();
                const reminders = event.reminders || [];

                reminders.forEach(reminder => {
                    if (reminder.toDate() >= now.toDate() && reminder.toDate() <= targetDate.toDate()) {
                        remindersDue.push({ eventId: doc.id, reminder });
                    }
                });
            });

            return remindersDue;
        } catch (error) {
            throw new ValidationError('Error fetching reminders by due date');
        }
    }
    /**
     * Retrieves all events for a specific calendar.
     * @param {string} calendarId - The ID of the calendar.
     * @returns {Promise<Array<Object>>} List of events.
     */
    static async getEventsByCalendarId(calendarId) {
        try {
            const snapshot = await db.collection('events')
                .where('calendarId', '==', calendarId)
                .get();

                if (snapshot.empty) {
                    return []; // Return an empty array if no events are found
                }
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new ValidationError('Error fetching events for the calendar: ' + error.message);
        }
    }

    /**
     * Deletes an event by its ID.
     * @param {string} eventId - The ID of the event to delete.
     * @returns {Promise<void>}
     */
    static async delete(eventId) {
        try {
            await db.collection('events').doc(eventId).delete();
        } catch (error) {
            throw new ValidationError('Error deleting event: ' + error.message);
        }
    }
    
     /**
     * @description Updates the `show` property of an event.
     * @param {string} eventId - The ID of the event to update.
     * @param {boolean} show - The new visibility status.
     * @returns {Object} The updated event.
     * @throws {NotFoundError} If the event does not exist.
     * @throws {ValidationError} If there is an error during the update.
     */
     static async updateEventVisibility(eventId, show) {
        try {
            const eventRef = db.collection('events').doc(eventId);
            const eventDoc = await eventRef.get();

            if (!eventDoc.exists) {
                throw new NotFoundError('Event not found');
            }

            await eventRef.update({ show });
            return { id: eventId, ...eventDoc.data(), show }; // Include updated `show` value
        } catch (error) {
            throw new ValidationError('Error updating event visibility: ' + error.message);
        }
    }
}

module.exports = Event;
