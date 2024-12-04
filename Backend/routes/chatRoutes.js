const express = require('express');
const MessagingController = require('../controllers/chatController');
const router = express.Router();

router.post('/start', MessagingController.createConversation);

router.get('/conversations', MessagingController.getUserConversations);
router.post('/messages/:conversationId', MessagingController.sendMessage);
router.get('/messages/:conversationId', MessagingController.getMessages);

module.exports = router;
