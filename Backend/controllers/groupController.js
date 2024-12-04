const Group = require('../models/groupModel');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const { ValidationError } = require('../utils/errorHandler');
const Calendar = require('../models/calendarModel');

class GroupController {
    /**
     * @description Creates a new group with a shared calendar.
     */
    static async createGroup(req, res, next) {
        const { name, description } = req.body;
        const ownerId = req.user.uid;

        if (!name) {
            return next(new ValidationError('Group name is required'));
        }

        try {
            const group = await Group.createGroup(ownerId, name, description);
            const calendar = await Calendar.createCalendar(ownerId, `${name}'s Group Calendar`, 'group');
            await Group.updateGroupCalendarId(group.id, calendar.id);


            await User.addGroup(ownerId, group.id); // i added this to store the group id in user


            res.status(201).json({ message: 'Group created successfully', group, calendar });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Updates the group document with the created calendar ID.
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
     * Adds a member to an existing group and notifies other members.
     */
    static async addMember(req, res, next) {
        const { groupId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return next(new ValidationError('User ID is required.'));
        }

        try {
            const result = await Group.addMember(groupId, userId);

            // Notify other group members
            const group = await Group.getGroupById(groupId);
            const notifications = group.members.map(memberId => ({
                fromUserId: userId,
                toUserId: memberId,
                type: 'group_member_added',
                message: `A new member has joined the group "${group.name}".`,
                status: 'unseen',
                timestamp: new Date(),
            }));

            await Promise.all(
                notifications.map(notification =>
                    Notification.addNotification(notification.toUserId, notification)
                )
            );

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Sends an invitation to a user to join a group and creates a notification.
     */
    static async sendInvitation(req, res, next) {
        const { groupId } = req.params;
        const { recipientId } = req.body;
        const senderId = req.user.uid;
    
        if (!recipientId) {
            return next(new ValidationError('Recipient ID is required'));
        }
    
        try {
            // Prevent sending invitations to oneself
            if (recipientId === senderId) {
                return res.status(400).json({ error: 'You cannot invite yourself to a group' });
            }
    
            // Check if the recipient is already a group member
            const group = await Group.getGroupById(groupId);
            if (group.members.includes(recipientId)) {
                return res.status(400).json({ error: 'User is already a member of the group' });
            }
    
            // Check if an invitation is already pending
            const existingInvitations = await Group.getPendingInvitations(groupId, recipientId);
            if (existingInvitations.length > 0) {
                return res.status(400).json({ error: 'An invitation has already been sent to this user' });
            }
    
            const groupName = group.name;
            const sender = await User.getById(senderId);
    
            // Create an invitation
            const invitation = await Group.sendInvitation(groupId, senderId, recipientId);
            await User.addGroupRequest(senderId, { requestId: invitation.id, status: 'sent' });
            await User.addGroupRequest(recipientId, { requestId: invitation.id, status: 'received' });

    
            // Create a notification for the recipient
            const notificationData = {
                fromUserId: senderId,
                toUserId: recipientId,
                type: 'group_invitation',
                message: `You have been invited to join the group ${groupName} by ${sender.name}.`,
                status: 'unseen',
                timestamp: new Date(),
            };
    
            await Notification.addNotification(recipientId, notificationData);
    
            res.status(201).json({ message: 'Invitation sent successfully', invitation });
        
        } catch (error) {
            next(error);
        }
                /* TODO  after accepting or rejecting we need to remove requests
                await User.removeGroupRequest(senderId, requestId);
                await User.removeGroupRequest(receiverId, requestId);
                await GroupRequest.deleteRequest(requestId);*/
    }
    

    /**
     * Responds to a group invitation and sends notifications based on the response.
     */
    static async respondToInvitation(req, res, next) {
        const { groupId, invitationId } = req.params;
        const { action } = req.body;
    
        const recipientId = req.user.uid;
    
        if (!['accept', 'decline'].includes(action)) {
            return next(new ValidationError('Invalid action. Must be "accept" or "decline".'));
        }
    
        try {
            const invitation = await Group.getInvitationById(invitationId);
    
            // Check if the invitation is valid
            if (!invitation || invitation.groupId !== groupId || invitation.recipientId !== recipientId) {
                return res.status(404).json({ error: 'Invitation not found or does not belong to this group' });
            }
    
            // Prevent accepting an invitation for a group the user is already a member of
            const group = await Group.getGroupById(groupId);
            if (group.members.includes(recipientId)) {
                return res.status(400).json({ error: 'You are already a member of this group' });
            }
    
            let responseMessage;
    
            if (action === 'accept') {
                // Add the user to the group
                await Group.addMember(groupId, recipientId);
    
                // Notify the group owner about the acceptance
                const notificationData = {
                    fromUserId: recipientId,
                    toUserId: group.ownerId,
                    type: 'group_join',
                    message: `A user has accepted the invitation to join the group "${group.name}".`,
                    status: 'unseen',
                    timestamp: new Date(),
                };
    
                await Notification.addNotification(group.ownerId, notificationData);
    
                responseMessage = 'Invitation accepted. You have joined the group.';
            } else if (action === 'decline') {
                responseMessage = 'Invitation declined.';
            }
    
            // Delete the invitation after response
            await Group.deleteInvitation(invitationId);
    
            res.status(200).json({ message: responseMessage });
        } catch (error) {
            next(error);
        }
    }
    

    /**
     * Gets all pending invitations for a group.
     */
    static async getInvitations(req, res, next) {
        const { groupId } = req.params;

        try {
            const invitations = await Group.getInvitations(groupId);
            res.status(200).json({ invitations });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Retrieves all members of a specified group.
     */
    static async getGroupMembers(req, res, next) {
        const { groupId } = req.params;
    
        try {
            const group = await Group.getGroupById(groupId);
            if (!group) {
                return res.status(404).json({ error: 'Group not found' });
            }
    
            res.status(200).json({ members: group.members });
        } catch (error) {
            next(error);
        }
    }
    
    
    

    /**
     * Removes a member from the group.
     */
    static async removeMember(req, res, next) {
        const { groupId, userId } = req.params;

        try {
            const result = await Group.removeMember(groupId, userId);

            // Notify other group members
            const group = await Group.getGroupById(groupId);
            const notifications = group.members.map(memberId => ({
                fromUserId: userId,
                toUserId: memberId,
                type: 'group_member_removed',
                message: `A member has been removed from the group "${group.name}".`,
                status: 'unseen',
                timestamp: new Date(),
            }));

            await Promise.all(
                notifications.map(notification =>
                    Notification.addNotification(notification.toUserId, notification)
                )
            );

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Retrieves the calendar associated with a specified group.
     * @route GET /api/groups/:groupId/calendar
     * @access Protected - requires user authentication
     */
    static async getGroupCalendar(req, res, next) {
        const { groupId } = req.params;

        try {
            const group = await Group.getGroupById(groupId);
            if (!group) {
                return res.status(404).json({ error: 'Group not found' });
            }

            const { calendarId } = group;
            if (!calendarId) {
                return res.status(404).json({ error: 'No calendar associated with this group' });
            }

            const calendar = await Calendar.getCalendarById(calendarId);
            if (!calendar) {
                return res.status(404).json({ error: 'Calendar not found' });
            }

            res.status(200).json(calendar);
        } catch (error) {
            next(error);
        }
    }

    static async getGroupById(req, res, next) {
        const { groupId } = req.params;


        if (!groupId) {
            return res.status(400).json({ error: 'Group ID is required' });
        }

        try {
            const group = await Group.getById(groupId);
            res.status(200).json(group);
        } catch (error) {
            console.error(`Error in getGroupById: ${error.message}`);
            next(new ValidationError(`Error fetching group: ${error.message}`));
        }
    }

 /**
     * @route POST /api/groups/:groupId/available-slot
     * @description Finds a common available slot for all members in a group.
     * @access Protected - requires user authentication
     * 
     * Request Body:
     * - meetingDuration (number): Duration of the meeting in milliseconds.
     * - startHour (number): Start hour of the day to check for availability (24-hour format).
     * - endHour (number): End hour of the day to check for availability (24-hour format).
     * 
     * Response:
     * - Success: Status 200 with an available time slot:
     *   {
     *     "start": "<start_time>",
     *     "end": "<end_time>"
     *   }
     * - Error: Status 404 if no available slot is found or 500 for server errors.
     *//*
    static async findAvailableSlot(req, res, next) {
        const { groupId } = req.params;
        const { meetingDuration, startHour, endHour } = req.body;

        if (!meetingDuration || startHour === undefined || endHour === undefined) {
            return next(new ValidationError('Meeting duration, start hour, and end hour are required.'));
        }

        try {
            // Fetch group and member schedules
            const groupData = await Group.getGroupById(groupId);
            const userSchedules = await Group.getUserSchedules(groupData.members);

            // Find available time slot
            const availableSlot = GroupController.findAvailableSlotInSchedules(userSchedules, meetingDuration, startHour, endHour);
            
            if (availableSlot) {
                res.status(200).json(availableSlot);
            } else {
                res.status(404).json({ message: 'No available time slot found for all users.' });
            }
        } catch (error) {
            next(error);
        }
    }*/

    /**
     * @description Finds the first available common slot for all group members based on their schedules.
     * @param {Array<Array<Object>>} userSchedules - Array of arrays containing each user's busy slots.
     * @param {number} meetingDuration - Duration of the desired meeting in milliseconds.
     * @param {number} startHour - Start hour of the day (24-hour format).
     * @param {number} endHour - End hour of the day (24-hour format).
     * @returns {Object|null} The start and end time of the first available slot, or null if none is found.
     *//*
    static findAvailableSlotInSchedules(userSchedules, meetingDuration, startHour, endHour) {
        const dayStart = new Date().setHours(startHour, 0, 0, 0);
        const dayEnd = new Date().setHours(endHour, 0, 0, 0);
        const timeIncrement = 30 * 60 * 1000; // 30 minutes in milliseconds

        const userBusySlots = userSchedules.map(schedule =>
            schedule.map(slot => [slot.start.getTime(), slot.end.getTime()])
        );

        for (let time = dayStart; time + meetingDuration <= dayEnd; time += timeIncrement) {
            const meetingEnd = time + meetingDuration;

            const isFreeForAll = userBusySlots.every(schedule =>
                schedule.every(([busyStart, busyEnd]) => meetingEnd <= busyStart || time >= busyEnd)
            );

            if (isFreeForAll) {
                return { start: new Date(time), end: new Date(meetingEnd) };
            }
        }

        return null;
    }*/
}

module.exports = GroupController;
