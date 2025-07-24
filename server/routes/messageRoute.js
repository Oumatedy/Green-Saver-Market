/**
 * server/routes/messageRoute.js
 *
 * Routes for message features:
 * - Conversations
 * - Messaging
 * - Attachments
 * - Real-time status
 */

const express = require('express');
const { body, query, param } = require('express-validator');

const router = express.Router();

const messageController = require('../controllers/MessageController');
const { authMiddleware } = require('../middlewares/authMiddleware');
// NOTE: Destructure validate if it's exported as { validate }
const { validate } = require('../middlewares/validationMiddleware');

/* ===========================
   Validation arrays
=========================== */ 

const messageValidation = [
  body('recipientId').notEmpty().withMessage('Recipient ID is required').isMongoId().withMessage('Invalid recipient ID format'),
  body('content').trim().notEmpty().withMessage('Message content is required').isLength({ max: 2000 }).withMessage('Content must not exceed 2000 characters'),
  body('attachments').optional().isArray().withMessage('Attachments must be an array'),
  body('attachments.*.type').optional().isIn(['image', 'file']).withMessage('Invalid attachment type'),
  body('attachments.*.url').optional().isURL().withMessage('Invalid attachment URL'),
  body('attachments.*.name').optional().trim().isLength({ max: 255 }).withMessage('Attachment name too long'),
  body('attachments.*.size').optional().isNumeric().withMessage('Invalid attachment size'),
  body('attachments.*.mimeType').optional().trim().isLength({ max: 100 }).withMessage('Invalid MIME type'),
];

const searchValidation = [
  query('query').trim().notEmpty().withMessage('Search query is required').isLength({ min: 1, max: 100 }).withMessage('Search query must be between 1 and 100 characters'),
];

const typingValidation = [
  body('recipientId').notEmpty().withMessage('Recipient ID is required').isMongoId().withMessage('Invalid recipient ID format'),
  body('isTyping').isBoolean().withMessage('Invalid typing status'),
];

const mongoIdValidation = [
  param('userId').isMongoId().withMessage('Invalid user ID format'),
];

const messageIdValidation = [
  param('messageId').isMongoId().withMessage('Invalid message ID format'),
];

const conversationIdValidation = [
  param('conversationId').isMongoId().withMessage('Invalid conversation ID format'),
];

/* ===========================
   Debugging middleware & handlers
=========================== */

console.log('DEBUG: messageRoute middleware and controllers types', {
  authMiddleware: typeof authMiddleware,
  validate: typeof validate,
  getConversations: typeof messageController.getConversations,
  getConversation: typeof messageController.getConversation,
  deleteConversation: typeof messageController.deleteConversation,
  sendMessage: typeof messageController.sendMessage,
  searchMessages: typeof messageController.searchMessages,
  getMessage: typeof messageController.getMessage,
  getMessages: typeof messageController.getMessages,
  deleteMessage: typeof messageController.deleteMessage,
  markAsRead: typeof messageController.markAsRead,
  uploadAttachment: typeof messageController.uploadAttachment,
  deleteAttachment: typeof messageController.deleteAttachment,
  getUnreadCount: typeof messageController.getUnreadCount,
  getTypingStatus: typeof messageController.getTypingStatus,
  updateTypingStatus: typeof messageController.updateTypingStatus,
});

/* ===========================
   Middleware Setup
=========================== */

// Apply authentication to all routes
router.use(authMiddleware);

/* ===========================
   Conversation Routes
=========================== */

router.get('/conversations', messageController.getConversations);

router.get('/conversations/:userId', mongoIdValidation, validate(), messageController.getConversation);

router.delete('/conversations/:userId', mongoIdValidation, validate(), messageController.deleteConversation);

/* ===========================
   Message Operations
=========================== */

router.post('/', messageValidation, validate(), messageController.sendMessage);

router.get('/search', searchValidation, validate(), messageController.searchMessages);

router.get('/message/:messageId', messageIdValidation, validate(), messageController.getMessage);

router.get('/:conversationId', conversationIdValidation, validate(), messageController.getMessages);

router.delete('/:messageId', messageIdValidation, validate(), messageController.deleteMessage);

router.patch('/:messageId/read', messageIdValidation, validate(), messageController.markAsRead);

/* ===========================
   Attachment Routes
=========================== */

router.post('/attachments', messageController.uploadAttachment);

router.delete('/attachments/:attachmentId', messageController.deleteAttachment);

/* ===========================
   Real-Time Status Routes
=========================== */

router.get('/status/unread', messageController.getUnreadCount);

router.get('/status/:userId/typing', mongoIdValidation, validate(), messageController.getTypingStatus);

router.post('/status/typing', typingValidation, validate(), messageController.updateTypingStatus);

/* ===========================
   Export router
=========================== */

module.exports = router;
