const { db, admin } = require('../firebaseAdmin');
const { ValidationError } = require('../utils/errorHandler');

class Group {
    /**
     * @description Creates a new group with a shared calendar.
     */
    static async createGroup(ownerId, name, description = '') {
        const groupData = {
            ownerId,
            name,
            description,
            createdAt: new Date(),
            members: [ownerId],
            calendarId: null // Calendar ID will be added later
        };

        try {
            const groupRef = await db.collection('groups').add(groupData);
            return { id: groupRef.id, ...groupData };
        } catch (error) {
            throw new ValidationError('Error creating group: ' + error.message);
        }
    }

    /**
     * @description Updates the group document with the created calendar ID.
     */
    static async updateGroupCalendarId(groupId, calendarId) {
        try {
            const groupRef = db.collection('groups').doc(groupId);
            await groupRef.update({ calendarId });
        } catch (error) {
            throw new ValidationError('Error updating group with calendar ID: ' + error.message);
        }
    }

    /**
     * @description Adds a member to the group and updates the user's groups list.
     */
    static async addMember(groupId, userId) {
        try {
            const groupRef = db.collection('groups').doc(groupId);
            const groupDoc = await groupRef.get();

            if (!groupDoc.exists) {
                throw new ValidationError('Group not found');
            }

            const groupData = groupDoc.data();

            if (groupData.members.includes(userId)) {
                return { message: 'User is already a member of the group' };
            }

            await groupRef.update({
                members: admin.firestore.FieldValue.arrayUnion(userId),
            });

            const userRef = db.collection('users').doc(userId);
            await userRef.update({
                groups: admin.firestore.FieldValue.arrayUnion(groupId),
            });

            return { message: 'Member added successfully' };
        } catch (error) {
            throw new ValidationError('Error adding member to group: ' + error.message);
        }
    }

    /**
     * @description Removes a member from the group and updates the user's groups list.
     */
    static async removeMember(groupId, userId) {
        try {
            const groupRef = db.collection('groups').doc(groupId);
            const groupDoc = await groupRef.get();

            if (!groupDoc.exists) {
                throw new ValidationError('Group not found');
            }

            await groupRef.update({
                members: admin.firestore.FieldValue.arrayRemove(userId),
            });

            const userRef = db.collection('users').doc(userId);
            await userRef.update({
                groups: admin.firestore.FieldValue.arrayRemove(groupId),
            });

            return { message: 'Member removed successfully' };
        } catch (error) {
            throw new ValidationError('Error removing member from group: ' + error.message);
        }
    }

    /**
     * @description Sends an invitation to a user to join a group.
     */
    static async sendInvitation(groupId, senderId, recipientId) {
        const invitationData = {
            groupId,
            senderId,
            recipientId,
            status: 'pending',
            createdAt: new Date(),
        };

        try {
            const invitationRef = await db.collection('invitations').add(invitationData);
            return { id: invitationRef.id, ...invitationData };
        } catch (error) {
            throw new ValidationError('Error sending invitation: ' + error.message);
        }
    }

    /**
     * @description Retrieves all pending invitations for a group.
     */
    static async getInvitations(groupId) {
        try {
            const invitationsSnapshot = await db.collection('invitations')
                .where('groupId', '==', groupId)
                .where('status', '==', 'pending')
                .get();

            return invitationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new ValidationError('Error fetching invitations: ' + error.message);
        }
    }

    /**
     * @description Handles a response to a group invitation.
     */
    static async respondToInvitation(groupId, invitationId, action) {
        try {
            const invitationRef = db.collection('invitations').doc(invitationId);
            await invitationRef.update({ status: action });

            if (action === 'accept') {
                const invitation = await invitationRef.get();
                const { recipientId } = invitation.data();
                await this.addMember(groupId, recipientId);
                return 'Invitation accepted and user added to group';
            } else {
                return 'Invitation declined';
            }
        } catch (error) {
            throw new ValidationError('Error responding to invitation: ' + error.message);
        }
    }

    /**
     * @description Retrieves the calendar associated with a group.
     */
    static async getGroupCalendar(groupId) {
        try {
            const groupDoc = await db.collection('groups').doc(groupId).get();
            if (!groupDoc.exists) {
                throw new ValidationError('Group not found');
            }

            const { calendarId } = groupDoc.data();
            if (!calendarId) {
                throw new ValidationError('No calendar found for this group');
            }

            return { calendarId };
        } catch (error) {
            throw new ValidationError('Error fetching group calendar: ' + error.message);
        }
    }

    /**
     * @description Retrieves the group details by its ID.
     */
    static async getGroupById(groupId) {
        const groupDoc = await db.collection('groups').doc(groupId).get();
    
        if (!groupDoc.exists) {
            throw new ValidationError('Group not found');
        }
    
        return groupDoc.data();
    }
    

    /**
     * Fetches user schedules for members of the group based on their events.
     */
    static async getUserSchedules(memberIds) {
        return await Promise.all(memberIds.map(async userId => {
            const eventsSnapshot = await db.collection('events')
                .where('createdBy', '==', userId)
                .get();

            return eventsSnapshot.docs.map(doc => {
                const event = doc.data();
                return { start: new Date(event.startDate), end: new Date(event.endDate) };
            });
        }));
    }
    
    /**
     * @description Retrieves the name of a group by its ID.
     * @param {string} groupId - The ID of the group.
     * @returns {Promise<string>} The name of the group.
     * @throws {ValidationError} If the group is not found or there is an error.
     */
    static async getGroupNameById(groupId) {
        try {
            const groupDoc = await db.collection('groups').doc(groupId).get();

            if (!groupDoc.exists) {
                throw new ValidationError('Group not found');
            }

            const groupData = groupDoc.data();
            return groupData.name; // Return the group name
        } catch (error) {
            throw new ValidationError('Error fetching group name: ' + error.message);
        }
    }

    static async getById(groupId) {
        try {
            const groupDoc = await db.collection('groups').doc(groupId).get();
            if (!groupDoc.exists) {
                throw new ValidationError('Group not found');
            }
            return { id: groupDoc.id, ...groupDoc.data() };
        } catch (error) {
            throw new ValidationError('Error fetching group');
        }
    }
    /**
     * @description Fetches all pending invitations for a specific group and recipient.
     * @param {string} groupId - The ID of the group.
     * @param {string} recipientId - The ID of the recipient.
     * @returns {Promise<Array>} Array of pending invitations.
     * @throws {ValidationError} If there is an error while fetching invitations.
     */
    static async getPendingInvitations(groupId, recipientId) {
        try {
            const snapshot = await db.collection('groupInvitations')
                .where('groupId', '==', groupId)
                .where('recipientId', '==', recipientId)
                .where('status', '==', 'pending')
                .get();

            if (snapshot.empty) {
                return [];
            }

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new ValidationError('Error fetching pending invitations: ' + error.message);
        }
    }

}

module.exports = Group;
