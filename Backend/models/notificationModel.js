const { db, admin } = require('../firebaseAdmin');
const { ValidationError } = require('../utils/errorHandler');

class Notification {
    /**
     * Creates a new notificationData document and returns its ID.
     */
    static async create(notificationData) {
        try {
            const notificationRef = await db.collection('notificationData').add(notificationData);
            return { id: notificationRef.id, ...notificationData };
        } catch (error) {
            throw new ValidationError('Error creating notificationData: ' + error.message);
        }
    }

    /**
     * Initializes a notification document for a new user.
     */
    static async init(userId) {
        const notificationRefData = {
            userId: userId,
            notificationIds: [] // Array to hold notificationData document IDs
        };

        try {
            const notificationDocRef = db.collection('notifications').doc(userId);
            await notificationDocRef.set(notificationRefData);

            return { id: userId, ...notificationRefData };
        } catch (error) {
            throw new ValidationError('Error creating notification document: ' + error.message);
        }
    }

    /**
     * Adds a new notificationData entry and links its ID to the user's notifications document.
     */
    static async addNotification(userId, notificationData) {
        try {
            // Create a new notificationData document
            const notificationRef = await db.collection('notificationData').add(notificationData);
            const notificationId = notificationRef.id;
    
            // Check if the user's notifications document exists
            const userNotificationsRef = db.collection('notifications').doc(userId);
            const userNotificationsDoc = await userNotificationsRef.get();
    
            if (!userNotificationsDoc.exists) {
                console.log(`Notifications document for user ${userId} does not exist. Initializing...`);
                await Notification.init(userId);
            }
    
            // Update the user's notifications document with the new notification ID
            console.log(`Adding notification ID ${notificationId} to user ${userId}'s notifications.`);
            await userNotificationsRef.update({
                notificationIds: admin.firestore.FieldValue.arrayUnion(notificationId),
            });
    
            return { message: 'Notification added successfully', notificationId };
        } catch (error) {
            throw new ValidationError('Error adding notification: ' + error.message);
        }
    }
    

     /**
     * @description Fetches reminders for the next 12 hours as dynamic notifications.
     * @param {string} userId - The user's ID.
     * @returns {Array<Object>} Notifications for upcoming reminders.
     */
     static async getUpcomingReminders(userId) {
        try {
            const now = admin.firestore.Timestamp.now();
            const next12Hours = admin.firestore.Timestamp.fromDate(new Date(now.toDate().getTime() + 12 * 60 * 60 * 1000));
    
            console.log('Fetching reminders for user:', userId);
            console.log('Current time:', now.toDate());
            console.log('Next 12 hours:', next12Hours.toDate());
    
            const upcomingRemindersSnapshot = await db.collection('scheduledReminders')
                .where('userId', '==', userId)
                .get();
    
            const reminders = upcomingRemindersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('All reminders for user:', reminders);
    
            // Filter reminders within the next 12 hours manually
            const filteredReminders = reminders.filter(reminder =>
                reminder.dueTime.toDate() >= now.toDate() &&
                reminder.dueTime.toDate() <= next12Hours.toDate()
            );
            console.log('Filtered reminders (next 12 hours):', filteredReminders);
    
            return filteredReminders.map(reminder => ({
                id: reminder.id,
                type: 'reminder',
                message: `You have an event "${reminder.message}" at ${reminder.dueTime.toDate().toLocaleString()}.`,
                status: 'upcoming',
                timestamp: reminder.dueTime.toDate(),
            }));
        } catch (error) {
            console.error('Error fetching upcoming reminders:', error.message);
            throw new ValidationError('Error fetching upcoming reminders: ' + error.message);
        }
    }
    
   /**
 * Combines stored notifications with dynamic notifications for reminders.
 */
static async getNotifications(userId, type) {
    try {
        console.log('Fetching notifications for user:', userId);

        // Step 1: Fetch upcoming reminders as dynamic notifications
        const dynamicNotifications = await this.getUpcomingReminders(userId);
        console.log('Dynamic notifications fetched:', dynamicNotifications);

        // Step 2: Fetch stored notifications
        const userNotificationsRef = db.collection('notifications').doc(userId);
        const userNotificationsDoc = await userNotificationsRef.get();

        let storedNotifications = [];
        if (userNotificationsDoc.exists) {
            const { notificationIds } = userNotificationsDoc.data();
            console.log('Notification IDs from user doc:', notificationIds);

            if (notificationIds && notificationIds.length > 0) {
                const notificationsSnapshot = await db.collection('notificationData')
                    .where(admin.firestore.FieldPath.documentId(), 'in', notificationIds)
                    .get();

                storedNotifications = notificationsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            }
        }
        console.log('Stored notifications fetched:', storedNotifications);

        // Step 3: Combine stored and dynamic notifications
        const combinedNotifications = [...storedNotifications, ...dynamicNotifications];
        console.log('Combined notifications:', combinedNotifications);

        // Step 4: Filter notifications based on type
        if (type === 'unseen') {
            const unseenNotifications = combinedNotifications.filter(notification => notification.status === 'unseen');
            console.log('Unseen notifications:', unseenNotifications);
            return unseenNotifications;
        }

        return combinedNotifications; // Return all notifications if type is 'all'
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        throw new ValidationError('Error fetching notifications: ' + error.message);
    }
}

    /**
     * Marks a notification as seen by updating its status in the notificationData collection.
     */
    static async markNotificationAsSeen(notificationId) {
        try {
            const notificationDataRef = db.collection('notificationData').doc(notificationId);
            await notificationDataRef.update({ status: 'seen' });
            return { message: 'Notification marked as seen' };
        } catch (error) {
            throw new ValidationError('Error updating notification status: ' + error.message);
        }
    }
}

module.exports = Notification;
