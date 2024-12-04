const Messaging = require('../models/chatModel');
const { ValidationError } = require('../utils/errorHandler');

class MessagingController {
    // Create a new conversation
    static async createConversation(req, res, next) {
        const { participants } = req.body;

        if (!participants || participants.length < 2) {
            return next(new ValidationError('A conversation must have at least two participants.'));
        }

        try {
            const conversation = await Messaging.createConversation(participants);
            res.status(201).json(conversation);
        } catch (error) {
            next(error);
        }
    }

    // Fetch all conversations for a user
    static async getUserConversations(req, res, next) {
        const userId = req.user.uid;

        try {
            const conversations = await Messaging.getUserConversations(userId);
            res.status(200).json(conversations);
        } catch (error) {
            next(error);
        }
    }

    // Send a message in a conversation
    static async sendMessage(req, res, next) {
        const { conversationId } = req.params;
        const { content } = req.body;
        const senderId = req.user.uid;

        if (!content) {
            return next(new ValidationError('Message content is required.'));
        }

        try {
            const message = await Messaging.sendMessage(conversationId, senderId, content);
            res.status(201).json(message);
        } catch (error) {
            next(error);
        }
    }

    // Get messages for a specific conversation
    static async getMessages(req, res, next) {
        const { conversationId } = req.params;

        try {
            const messages = await Messaging.getMessages(conversationId);
            res.status(200).json(messages);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = MessagingController;
