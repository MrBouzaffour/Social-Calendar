const { db, admin } = require('../firebaseAdmin');
const { ValidationError } = require('../utils/errorHandler');

class Messaging {
    // Create a new conversation
    static async createConversation(participants) {
        const conversation = {
            participants,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastMessage: '',
            lastMessageTime: null,
        };

        try {
            const conversationRef = await db.collection('conversations').add(conversation);
            return { id: conversationRef.id, ...conversation };
        } catch (error) {
            throw new ValidationError('Error creating conversation: ' + error.message);
        }
    }

    // Fetch all conversations for a user
    static async getUserConversations(userId) {
        try {
            const snapshot = await db.collection('conversations')
                .where('participants', 'array-contains', userId)
                .orderBy('lastMessageTime', 'desc')
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new ValidationError('Error fetching conversations: ' + error.message);
        }
    }

    // Add a new message to a conversation
    static async sendMessage(conversationId, senderId, content) {
        const message = {
            conversationId,
            senderId,
            content,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            seenBy: [senderId],
        };

        try {
            const messageRef = await db.collection('messages').add(message);

            // Update conversation metadata
            await db.collection('conversations').doc(conversationId).update({
                lastMessage: content,
                lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
            });

            return { id: messageRef.id, ...message };
        } catch (error) {
            throw new ValidationError('Error sending message: ' + error.message);
        }
    }

    // Get all messages for a specific conversation
    static async getMessages(conversationId) {
        try {
            const snapshot = await db.collection('messages')
                .where('conversationId', '==', conversationId)
                .orderBy('createdAt', 'asc')
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new ValidationError('Error fetching messages: ' + error.message);
        }
    }
}

module.exports = Messaging;
