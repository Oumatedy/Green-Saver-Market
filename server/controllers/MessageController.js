const Message = require('../models/messageModel');
const User = require('../models/userModel');
const BaseController = require('./BaseController');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../utils/appError');
const socketService = require('../services/socketService');

class MessageController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get user's conversations with last message and unread counts.
   * GET /api/v1/messages/conversations
   */
  getConversations = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { recipientId: userId }],
        },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$senderId', userId] }, '$recipientId', '$senderId'],
          },
          lastMessage: { $last: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$recipientId', userId] }, { $eq: ['$read', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          user: {
            _id: 1,
            name: 1,
            email: 1,
            avatar: 1,
          },
          lastMessage: 1,
          unreadCount: 1,
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    this.ok(res, conversations);
  });

  /**
   * Get a specific conversation between current user and another user.
   * GET /api/v1/messages/conversations/:userId
   */
  getConversation = asyncHandler(async (req, res) => {
    const otherUserId = req.params.userId;
    const currentUserId = req.user.userId;

    // Get conversation details with message count
    const conversation = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: currentUserId, recipientId: otherUserId },
            { senderId: otherUserId, recipientId: currentUserId }
          ]
        }
      },
      {
        $group: {
          _id: null,
          messageCount: { $sum: 1 },
          lastMessage: { $last: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$recipientId', currentUserId] }, { $eq: ['$read', false] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const otherUser = await User.findById(otherUserId, 'name email avatar');
    if (!otherUser) {
      throw new NotFoundError('User not found');
    }

    const result = {
      user: otherUser,
      messageCount: conversation[0]?.messageCount || 0,
      lastMessage: conversation[0]?.lastMessage || null,
      unreadCount: conversation[0]?.unreadCount || 0
    };

    this.ok(res, result);
  });

  /**
   * Get messages in a conversation between current user and conversationId.
   * Supports pagination.
   * GET /api/v1/messages/:conversationId
   */
  getMessages = asyncHandler(async (req, res) => {
    const conversationId = req.params.conversationId;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100); // cap limit to 100
    const userId = req.user.userId;

    // Mark unread messages as read where recipient is current user
    await Message.updateMany(
      {
        $or: [
          { senderId: conversationId, recipientId: userId },
          { senderId: userId, recipientId: conversationId },
        ],
        read: false,
        recipientId: userId,
      },
      { read: true, readAt: new Date() }
    );

    const messages = await Message.find({
      $or: [
        { senderId: conversationId, recipientId: userId },
        { senderId: userId, recipientId: conversationId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('senderId', 'name email avatar')
      .populate('recipientId', 'name email avatar')
      .lean();

    this.ok(res, messages);
  });

  /**
   * Get a single message by ID.
   * GET /api/v1/messages/message/:messageId
   */
  getMessage = asyncHandler(async (req, res) => {
    const messageId = req.params.messageId;
    const userId = req.user.userId;

    const message = await Message.findOne({
      _id: messageId,
      $or: [{ senderId: userId }, { recipientId: userId }]
    })
    .populate('senderId', 'name email avatar')
    .populate('recipientId', 'name email avatar');

    if (!message) {
      throw new NotFoundError('Message not found or unauthorized');
    }

    this.ok(res, message);
  });

  /**
   * Send a new message to a recipient.
   * POST /api/v1/messages
   */
  sendMessage = asyncHandler(async (req, res) => {
    const { recipientId, content, attachments } = req.body;
    const senderId = req.user.userId;

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      throw new NotFoundError('Recipient not found');
    }

    // Create and save message
    const message = await Message.create({
      senderId,
      recipientId,
      content,
      attachments,
    });

    // Populate sender and recipient fields for response
    await message.populate('senderId', 'name email avatar');
    await message.populate('recipientId', 'name email avatar');

    // Emit socket event to recipient with conversation info
    socketService.emitToUser(recipientId, 'new_message', {
      message,
      conversation: {
        _id: senderId,
        user: {
          _id: senderId,
          name: req.user.name,
          email: req.user.email,
          avatar: req.user.avatar,
        },
        lastMessage: message,
        unreadCount: 1,
      },
    });

    this.ok(res, message);
  });

  /**
   * Search messages for current user.
   * GET /api/v1/messages/search?query=searchTerm&page=1&limit=20
   */
  searchMessages = asyncHandler(async (req, res) => {
    const { query: searchQuery } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const userId = req.user.userId;

    const messages = await Message.find({
      $and: [
        {
          $or: [{ senderId: userId }, { recipientId: userId }]
        },
        {
          content: { $regex: searchQuery, $options: 'i' }
        }
      ]
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('senderId', 'name email avatar')
    .populate('recipientId', 'name email avatar');

    this.ok(res, messages);
  });

  /**
   * Delete a message by id (sender only).
   * DELETE /api/v1/messages/:messageId
   */
  deleteMessage = asyncHandler(async (req, res) => {
    const messageId = req.params.messageId;
    const userId = req.user.userId;

    // Find message by id and senderId (authorization)
    const message = await Message.findOne({ _id: messageId, senderId: userId });
    if (!message) {
      throw new NotFoundError('Message not found or unauthorized');
    }

    await message.deleteOne();

    // Notify recipient that message was deleted
    socketService.emitToUser(String(message.recipientId), 'message_deleted', {
      messageId,
    });

    this.ok(res, { message: 'Message deleted successfully' });
  });

  /**
   * Delete entire conversation between current user and another user.
   * DELETE /api/v1/messages/conversations/:userId
   */
  deleteConversation = asyncHandler(async (req, res) => {
    const otherUserId = req.params.userId;
    const currentUserId = req.user.userId;

    const result = await Message.deleteMany({
      $or: [
        { senderId: currentUserId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: currentUserId }
      ]
    });

    // Notify other user about conversation deletion
    socketService.emitToUser(otherUserId, 'conversation_deleted', {
      userId: currentUserId,
      deletedCount: result.deletedCount
    });

    this.ok(res, { 
      message: 'Conversation deleted successfully',
      deletedCount: result.deletedCount 
    });
  });

  /**
   * Mark a message as read.
   * PATCH /api/v1/messages/:messageId/read
   */
  markAsRead = asyncHandler(async (req, res) => {
    const messageId = req.params.messageId;
    const userId = req.user.userId;

    const message = await Message.findOneAndUpdate(
      { _id: messageId, recipientId: userId },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!message) {
      throw new NotFoundError('Message not found or unauthorized');
    }

    // Notify sender that message was read
    socketService.emitToUser(String(message.senderId), 'message_read', {
      messageId,
      readAt: message.readAt
    });

    this.ok(res, message);
  });

  /**
   * Get unread message count for current user.
   * GET /api/v1/messages/status/unread
   */
  getUnreadCount = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const unreadCount = await Message.countDocuments({
      recipientId: userId,
      read: false
    });

    this.ok(res, { unreadCount });
  });

  /**
   * Get typing status for a conversation.
   * GET /api/v1/messages/status/:userId/typing
   */
  getTypingStatus = asyncHandler(async (req, res) => {
    const otherUserId = req.params.userId;
    const currentUserId = req.user.userId;

    // This would typically be stored in Redis or memory
    // For now, returning a simple response
    this.ok(res, { 
      userId: otherUserId,
      isTyping: false // This should come from your real-time service
    });
  });

  /**
   * Update typing status.
   * POST /api/v1/messages/status/typing
   */
  updateTypingStatus = asyncHandler(async (req, res) => {
    const { recipientId, isTyping } = req.body;
    const senderId = req.user.userId;

    // Store typing status (typically in Redis)
    // For now, just emit socket event
    socketService.emitToUser(recipientId, 'typing_status', {
      userId: senderId,
      isTyping,
      user: {
        _id: senderId,
        name: req.user.name,
        avatar: req.user.avatar
      }
    });

    this.ok(res, { message: 'Typing status updated' });
  });

  /**
   * Upload attachment (placeholder - implement based on your file upload service).
   * POST /api/v1/messages/attachments
   */
  uploadAttachment = asyncHandler(async (req, res) => {
    // Implement file upload logic here
    // This would typically use multer or similar
    this.ok(res, { message: 'Attachment upload not implemented yet' });
  });

  /**
   * Delete attachment (placeholder).
   * DELETE /api/v1/messages/attachments/:attachmentId
   */
  deleteAttachment = asyncHandler(async (req, res) => {
    // Implement attachment deletion logic here
    this.ok(res, { message: 'Attachment deletion not implemented yet' });
  });
}

module.exports = new MessageController();