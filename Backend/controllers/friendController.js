    const FriendRequest = require('../models/friendModel');
    const User = require('../models/userModel');
    const { ValidationError } = require('../utils/errorHandler');
    const Notification = require("../models/notificationModel");

    const { admin } = require('../firebaseAdmin');


    class FriendController {

        /**
         * Sends a friend request from the authenticated user to the specified receiver.
         */
        static async sendFriendRequest(req, res, next) {
            const { receiverId } = req.body;
            const senderId = req.user.uid;
        
            if (!receiverId) {
                return res.status(400).json({ error: 'Receiver ID is required' });
            }
        
            try {
                // Check if the sender is sending a request to themselves
                if (receiverId === senderId) {
                    return res.status(400).json({ error: 'You cannot send a friend request to yourself' });
                }
        
                // Retrieve sender and receiver details
                const sender = await User.getById(senderId);
                const receiver = await User.getById(receiverId);
        
                if (!sender || !receiver) {
                    return res.status(404).json({ error: 'User not found' });
                }
        
                // Check if they are already friends
                if (sender.friends && sender.friends.includes(receiverId)) {
                    return res.status(400).json({ error: 'You are already friends with this user' });
                }
        
                // Check if a pending friend request already exists
                const existingRequests = await FriendRequest.getPendingFriendRequests(receiverId);
                const isRequestAlreadySent = existingRequests.some(
                    (req) => req.senderId === senderId && req.receiverId === receiverId
                );
        
                if (isRequestAlreadySent) {
                    return res.status(400).json({ error: 'Friend request already sent' });
                }
        
                // Create a friend request
                const request = await FriendRequest.sendRequest(senderId, receiverId);
                await User.addFriendRequest(senderId, { requestId: request.id, status: 'sent' });
                await User.addFriendRequest(receiverId, { requestId: request.id, status: 'received' });
        
                // Prepare notification data
                const notificationData = {
                    fromUserId: senderId,
                    toUserId: receiverId,
                    type: "friend_request",
                    message: `You have received a friend request from ${sender.name}`,
                    status: "unseen",
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                };
        
                // Add notification
                const notificationResult = await Notification.addNotification(receiverId, notificationData);
        
                res.status(201).json({
                    message: 'Friend request sent',
                    request,
                    notificationId: notificationResult.notificationId,
                });
            } catch (error) {
                next(error);
            }
        }
        
        
        


        /**
         * @description Handles a friend request by accepting or rejecting it.
         * @param {Object} req - Express request object, expects `requestId` in params and `action` in body.
         * @param {Object} res - Express response object.
         * @param {Function} next - Express next middleware function.
         * @returns {Object} JSON with success message based on the action taken.
         */
        static async handleFriendRequest(req, res, next) {
            const { requestId } = req.params;
            let { action } = req.body;
        
            // Allow "reject" as an alias for "decline"
            if (action === 'reject') {
                action = 'decline';
            }
        
            if (!['accept', 'decline'].includes(action)) {
                return next(new ValidationError('Invalid action. Must be "accept" or "decline".'));
            }
        
            try {
                const request = await FriendRequest.getRequestById(requestId);
                if (!request) {
                    return res.status(404).json({ error: 'Friend request not found' });
                }
        
                const { senderId, receiverId } = request;
                const sender = await User.getById(senderId);
                if (!sender) {
                    return res.status(404).json({ error: 'Sender not found' });
                }
        
                if (action === 'accept') {
                    await User.addFriend(senderId, receiverId);
                    await FriendRequest.updateRequestStatus(requestId, 'accepted');
                    const notificationData = {
                        fromUserId: receiverId,
                        toUserId: senderId,
                        type: "friend_request_accepted",
                        message: `Your friend request was accepted by ${receiverId}.`,
                        status: "unseen",
                        timestamp: admin.firestore.FieldValue.serverTimestamp()
                    };
                    await Notification.addNotification(senderId, notificationData);
                    res.status(200).json({ message: 'Friend request accepted' });
                } else {
                    await FriendRequest.updateRequestStatus(requestId, 'rejected');
                    const notificationData = {
                        fromUserId: receiverId,
                        toUserId: senderId,
                        type: "friend_request_rejected",
                        message: `Your friend request was rejected by ${receiverId}.`,
                        status: "unseen",
                        timestamp: admin.firestore.FieldValue.serverTimestamp()
                    };
                    await Notification.addNotification(senderId, notificationData);
                    res.status(200).json({ message: 'Friend request rejected' });
                }
        
                await User.removeFriendRequest(senderId, requestId);
                await User.removeFriendRequest(receiverId, requestId);
                await FriendRequest.deleteRequest(requestId);
            } catch (error) {
                console.error('Error handling friend request:', error.message);
                next(error);
            }
        }
        
        
        

        /**
         * @description Retrieves all pending friend requests for the authenticated user.
         * @param {Object} req - Express request object.
         * @param {Object} res - Express response object.
         * @param {Function} next - Express next middleware function.
         * @returns {Object} JSON with an array of friend requests.
         */
         /**
     * Handles fetching all pending friend requests for a user.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {void} Sends a JSON response with the friend requests or forwards an error.
     */
    static async getFriendRequests(req, res, next) {
        const userId = req.user.uid;

        try {
            const requests = await FriendRequest.getPendingFriendRequests(userId);
            res.status(200).json(requests);
        } catch (error) {
            next(error);
        }
    }
    }

    module.exports = FriendController;
