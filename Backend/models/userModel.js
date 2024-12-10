const { db, admin } = require('../firebaseAdmin');
const { ValidationError, NotFoundError, UnauthorizedError } = require('../utils/errorHandler');
const bcrypt = require('bcrypt');

class User {
    /**
     * Hashes the provided password.
     * @param {string} password - The password to hash.
     * @returns {Promise<string>} The hashed password.
     */
    static async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }

    /**
     * Creates a new user with the given email, password, and name.
     * @param {string} email - The user's email address.
     * @param {string} hashedPassword - The hashed password.
     * @param {string} name - The user's name.
     * @param {Object} otherUserInfo - Additional user information.
     * @returns {Promise<Object>} The created user's data.
     * @throws {ValidationError} If the email is already in use.
     */
    static async createUser({ email, password, name, ...otherUserInfo }) {
        try {
           // Check if email already exists
            const existingUserSnapshot = await db.collection('users').where('email', '==', email).get();
            if (!existingUserSnapshot.empty) {
                throw new ValidationError('Email is already in use');
            }

            // Prepare user document
            const userDoc = {
                email,
                password,
                name,
                ...otherUserInfo
            };

            // Add user to Firestore
            const userRef = await db.collection('users').add(userDoc);
            return { id: userRef.id, ...userDoc };
        } catch (error) {
            console.error('Error in createUser:', error);
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new Error(`Unexpected error in createUser: ${error.message}`);
        }
}


    /**
     * Authenticates a user by email and password.
     * @param {string} email - The user's email address.
     * @param {string} password - The user's password.
     * @returns {Promise<Object>} The authenticated user's data and a custom token.
     * @throws {UnauthorizedError} If the email or password is incorrect.
     */
    static async login(email, password) {
        try {
            const userSnapshot = await db.collection('users').where('email', '==', email).get();
            if (userSnapshot.empty) {
                throw new UnauthorizedError('Invalid email or password');
            }
            const userData = userSnapshot.docs[0].data();
            const isPasswordMatch = await bcrypt.compare(password, userData.password);
            if (!isPasswordMatch) {
                throw new UnauthorizedError('Invalid email or password');
            }
            const customToken = await admin.auth().createCustomToken(userSnapshot.docs[0].id);
            return { id: userSnapshot.docs[0].id, ...userData, token: customToken };
        } catch (error) {
            throw new UnauthorizedError('Invalid email or password');
        }
    }

    /**
     * Retrieves the public profile of a user by their ID.
     * @param {string} userId - The ID of the user.
     * @returns {Promise<Object|null>} The user's public profile data or null if not found.
     */
    static async getPublicProfileById(userId) {
        try {
            const userRef = db.collection('users').doc(userId);
            const doc = await userRef.get();
            if (!doc.exists) return null;
            return {
                name: doc.data().name,
                email: doc.data().email,
                profilePic: doc.data().profilePic,
                yearOfBirth: doc.data().yearOfBirth,
                occupation: doc.data().occupation,
            };
        } catch (error) {
            throw new Error('Failed to fetch user profile');
        }
    }

    /**
     * Retrieves a user by their ID.
     * @param {string} userId - The ID of the user.
     * @returns {Promise<Object>} The user's data.
     * @throws {NotFoundError} If the user is not found.
     */
    static async getById(userId) {
        try {
            const userRef = db.collection('users').doc(userId);
            const doc = await userRef.get();
            if (!doc.exists) throw new NotFoundError('User not found');
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            throw new NotFoundError('Error fetching user');
        }
    }

    /**
     * Updates a user's profile data.
     * @param {string} userId - The ID of the user.
     * @param {Object} updatedData - The data to update.
     * @returns {Promise<Object>} The updated user data.
     * @throws {ValidationError} If the update fails.
     */
    static async updateUser(userId, updatedData) {
        try {
            const userRef = db.collection('users').doc(userId);
            await userRef.update(updatedData);
            return this.getById(userId);
        } catch (error) {
            throw new ValidationError('Error updating profile');
        }
    }

    /**
     * Deletes a user's account.
     * @param {string} userId - The ID of the user.
     * @throws {NotFoundError} If the user deletion fails.
     */
    static async deleteUser(userId) {
        try {
            await db.collection('users').doc(userId).delete();
        } catch (error) {
            throw new NotFoundError('Error deleting account');
        }
    }

    /**
     * Adds a friend request to the user's friendRequests list.
     * @param {string} userId - The ID of the user.
     * @param {Object} requestDetails - The friend request details.
     * @throws {ValidationError} If adding the friend request fails.
     */
    static async addFriendRequest(userId, requestDetails) {
        try {
            const userRef = db.collection('users').doc(userId);
            await userRef.update({
                friendRequests: admin.firestore.FieldValue.arrayUnion(requestDetails)
            });
        } catch (error) {
            throw new ValidationError('Error adding friend request to user: ' + error.message);
        }
    }
    static async addGroupRequest(userId, requestDetails) {
        try {
            const userRef = db.collection('users').doc(userId);
            await userRef.update({
                invitations: admin.firestore.FieldValue.arrayUnion(requestDetails)
            });
        } catch (error) {
            throw new ValidationError('Error adding group request to user: ' + error.message);
        }
    }
    /**
     * Removes a friend request from the user's friendRequests list.
     * @param {string} userId - The ID of the user.
     * @param {string} requestId - The ID of the friend request to remove.
     * @throws {ValidationError} If removing the friend request fails.
     */
    static async removeFriendRequest(userId, requestId) {
        try {
            const userRef = db.collection('users').doc(userId);
            await userRef.update({
                friendRequests: admin.firestore.FieldValue.arrayRemove(requestId)
            });
        } catch (error) {
            throw new ValidationError('Error removing friend request: ' + error.message);
        }
    }

    /**
     * Adds a friend to both users' friends lists.
     * @param {string} userId - The ID of the user.
     * @param {string} friendId - The ID of the friend to add.
     * @throws {ValidationError} If adding the friend fails.
     */
    static async addFriend(userId, friendId) {
        try {
            const userRef = db.collection('users').doc(userId);
            const friendRef = db.collection('users').doc(friendId);
            await userRef.update({
                friends: admin.firestore.FieldValue.arrayUnion(friendId)
            });
            await friendRef.update({
                friends: admin.firestore.FieldValue.arrayUnion(userId)
            });
        } catch (error) {
            throw new ValidationError('Error adding friend: ' + error.message);
        }
    }


    static async addGroup(userId, groupId) {
        try {
            const userRef = db.collection('users').doc(userId);
            await userRef.update({
                groups: admin.firestore.FieldValue.arrayUnion(groupId)
            });

        } catch (error) {
            throw new ValidationError('Error adding group: ' + error.message);
        }
    }
    /**
     * Removes a friend from both users' friends lists.
     * @param {string} userId - The ID of the user.
     * @param {string} friendId - The ID of the friend to remove.
     * @throws {ValidationError} If removing the friend fails.
     */
    static async removeFriend(userId, friendId) {
        try {
            const userRef = db.collection('users').doc(userId);
            const friendRef = db.collection('users').doc(friendId);
            await userRef.update({
                friends: admin.firestore.FieldValue.arrayRemove(friendId)
            });
            await friendRef.update({
                friends: admin.firestore.FieldValue.arrayRemove(userId)
            });
        } catch (error) {
            throw new ValidationError('Error removing friend: ' + error.message);
        }
    }

    /**
     * Retrieves the friend list of a user by their ID.
     * @param {string} userId - The ID of the user.
     * @returns {Promise<Array<string>>} The list of friend IDs.
     * @throws {NotFoundError} If the user is not found.
     */
    static async getFriends(userId) {
        try {
            const userRef = db.collection('users').doc(userId);
            const doc = await userRef.get();
            if (!doc.exists) throw new NotFoundError('User not found');
            return doc.data().friends || [];
        } catch (error) {
            throw new ValidationError('Error fetching friend list: ' + error.message);
        }
    }
    static async getInvitationsIds(userId) {
        try {
            const userRef = db.collection('users').doc(userId);
            const doc = await userRef.get();
            if (!doc.exists) throw new NotFoundError('User not found');
            return doc.data().invitations || [];
        } catch (error) {
            throw new ValidationError('Error fetching friend list: ' + error.message);
        }
    }

    static async getGroups(userId){
        try{
        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();
        if (!doc.exists) throw new NotFoundError('User not found');
        return doc.data().groups || [];
    }catch(error){
        throw new ValidationError('Error fetching group list: ' + error.message);

    }
    }

    /**
     * @description Fetches all public events for a user based on the `show` property.
     * @param {string} userId - The ID of the user whose events are being fetched.
     * @returns {Array} An array of public events for the user.
     * @throws {NotFoundError} If no public events are found.
     * @throws {ValidationError} If there is an error while fetching events.
     */
    static async getPublicEvents(userId) {
        try {
            const eventsSnapshot = await db.collection('events')
                .where('userId', '==', userId)
                .where('show', '==', true)
                .get();

            if (eventsSnapshot.empty) {
                throw new NotFoundError('No public events found for this user.');
            }

            return eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new ValidationError('Error fetching public events: ' + error.message);
        }
    }
    /**
    * @description Search users by name (case-insensitive partial match).
    * @param {string} name - The name to search for.
    * @returns {Promise<Array>} Array of user profiles matching the search.
    */
    static async searchByName(name) {
       try {
           const usersSnapshot = await db.collection('users')
               .where('name', '>=', name)
               .where('name', '<=', name + '\uf8ff') // Use Firestore range queries for partial matches
               .get();

           if (usersSnapshot.empty) {
               return [];
           }

           return usersSnapshot.docs.map(doc => ({
               id: doc.id,
               name: doc.data().name,
               email: doc.data().email,
               profilePic: doc.data().profilePic || null,
           }));
       } catch (error) {
           throw new Error('Error searching users by name: ' + error.message);
       }
    }
}

module.exports = User;
