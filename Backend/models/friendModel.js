const { db } = require('../firebaseAdmin');
const { ValidationError } = require('../utils/errorHandler');

class FriendRequest {
    /**
     * @description Sends a friend request from one user to another.
     * @param {string} senderId - The ID of the user sending the request.
     * @param {string} receiverId - The ID of the user receiving the request.
     * @returns {Object} The friend request data including its ID.
     * @throws {ValidationError} If there is an error while sending the friend request.
     */
    static async sendRequest(senderId, receiverId) {
        try {
            const requestData = {
                senderId,
                receiverId,
                status: 'pending',
                createdAt: new Date()
            };

            const requestRef = await db.collection('friendRequests').add(requestData);
            return { id: requestRef.id, ...requestData };
        } catch (error) {
            throw new ValidationError('Error sending friend request: ' + error.message);
        }
    }

    /**
     * @description Retrieves a friend request by its ID.
     * @param {string} requestId - The ID of the friend request to retrieve.
     * @returns {Object} The friend request data including its ID.
     * @throws {ValidationError} If the friend request is not found or there is an error while fetching it.
     */
    static async getRequestById(requestId) {
        try {
            const requestDoc = await db.collection('friendRequests').doc(requestId).get();
            if (!requestDoc.exists) throw new ValidationError('Friend request not found');
            return { id: requestDoc.id, ...requestDoc.data() };
        } catch (error) {
            throw new ValidationError('Error fetching friend request: ' + error.message);
        }
    }

    /**
     * @description Updates the status of a friend request.
     * @param {string} requestId - The ID of the friend request to update.
     * @param {string} status - The new status of the friend request (e.g., 'accepted', 'rejected').
     * @throws {ValidationError} If there is an error while updating the friend request status.
     */
    static async updateRequestStatus(requestId, status) {
        try {
            await db.collection('friendRequests').doc(requestId).update({ status });
        } catch (error) {
            throw new ValidationError('Error updating request status: ' + error.message);
        }
    }

    /**
     * @description Deletes a friend request.
     * @param {string} requestId - The ID of the friend request to delete.
     * @throws {ValidationError} If there is an error while deleting the friend request.
     */
    static async deleteRequest(requestId) {
        try {
            await db.collection('friendRequests').doc(requestId).delete();
        } catch (error) {
            throw new ValidationError('Error deleting friend request: ' + error.message);
        }
    }
    /**
     * Fetches all pending friend requests for a specific user.
     * @param {string} userId - The ID of the user receiving the friend requests.
     * @returns {Promise<Array>} An array of friend requests.
     * @throws {ValidationError} If there is an error while fetching friend requests.
     */
    static async getPendingFriendRequests(userId) {
        try {
            const snapshot = await db.collection('friendRequests')
                .where('receiverId', '==', userId)
                .where('status', '==', 'pending')
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new ValidationError('Error fetching friend requests: ' + error.message);
        }
    }
}

module.exports = FriendRequest;
