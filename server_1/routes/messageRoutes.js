const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');

// Validation rules
const messageValidation = [
  body('recipientId').notEmpty().withMessage('Recipient ID is required'),
  body('content').trim().notEmpty().withMessage('Message content is required'),
  body('attachments').optional().isArray(),
  body('attachments.*.type').optional().isIn(['image', 'file']).withMessage('Invalid attachment type'),
  body('attachments.*.url').optional().isURL().withMessage('Invalid attachment URL')
];

// Protected routes - require authentication
router.use(authMiddleware);

// Conversation Management
router.get('/conversations', messageController.getConversations);
router.get('/:conversationId', messageController.getMessages);
router.post('/', messageValidation, validate(), messageController.sendMessage);
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
router.get('/conversations/:userId', messageController.getConversation);
router.delete('/conversations/:userId', messageController.deleteConversation);

// Message Operations
router.post('/', messageValidation, messageController.sendMessage);
router.get('/:messageId', messageController.getMessage);
router.delete('/:messageId', messageController.deleteMessage);
router.patch('/:messageId/read', messageController.markAsRead);

// Message Search and Filtering
router.get('/search', [
  body('query').trim().notEmpty().withMessage('Search query is required')
], messageController.searchMessages);

// Attachment Handling
router.post('/attachments', messageController.uploadAttachment);
router.delete('/attachments/:attachmentId', messageController.deleteAttachment);

// Real-time Status
router.get('/status/unread', messageController.getUnreadCount);
router.get('/status/:userId/typing', messageController.getTypingStatus);
router.post('/status/typing', [
  body('recipientId').notEmpty().withMessage('Recipient ID is required'),
  body('isTyping').isBoolean().withMessage('Invalid typing status')
], messageController.updateTypingStatus);

module.exports = router;
