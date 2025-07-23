const Message = require('../models/messageModel');
const User = require('../models/userModel');
const { NotFoundError, BadRequestError } = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const socketService = require('../services/socketService');

class MessageController {
  /**
   * Get user's conversations
   */
  getConversations = asyncHandler(async (req, res) => {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: req.user.userId },
            { recipientId: req.user.userId }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', req.user.userId] },
              '$recipientId',
              '$senderId'
            ]
          },
          lastMessage: { $last: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$recipientId', req.user.userId] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          user: {
            _id: 1,
            name: 1,
            email: 1,
            avatar: 1
          },
          lastMessage: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    ApiResponse.success(conversations, 'Conversations retrieved successfully').send(res);
  });

  /**
   * Get messages in a conversation
   */
  getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Mark messages as read
    await Message.updateMany(
      {
        $or: [
          { senderId: conversationId, recipientId: req.user.userId },
          { senderId: req.user.userId, recipientId: conversationId }
        ],
        read: false,
        recipientId: req.user.userId
      },
      { read: true }
    );

    const messages = await Message.find({
      $or: [
        { senderId: conversationId, recipientId: req.user.userId },
        { senderId: req.user.userId, recipientId: conversationId }
      ]
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('senderId', 'name email avatar')
      .populate('recipientId', 'name email avatar');

    ApiResponse.success(messages, 'Messages retrieved successfully').send(res);
  });

  /**
   * Send a new message
   */
  sendMessage = asyncHandler(async (req, res) => {
    const { recipientId, content, attachments } = req.body;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      throw new NotFoundError('Recipient not found');
    }

    // Create message
    const message = await Message.create({
      senderId: req.user.userId,
      recipientId,
      content,
      attachments,
    });

    // Populate sender and recipient info
    await message.populate('senderId', 'name email avatar');
    await message.populate('recipientId', 'name email avatar');

    // Emit socket event to recipient
    socketService.emitToUser(recipientId, 'new_message', {
      message,
      conversation: {
        _id: req.user.userId,
        user: {
          _id: req.user.userId,
          name: req.user.name,
          email: req.user.email,
          avatar: req.user.avatar
        },
        lastMessage: message,
        unreadCount: 1
      }
    });

    ApiResponse.success(message, 'Message sent successfully').send(res);
  });

  /**
   * Delete a message
   */
  deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    
    const message = await Message.findOne({
      _id: messageId,
      senderId: req.user.userId
    });

    if (!message) {
      throw new NotFoundError('Message not found or unauthorized');
    }

    await message.remove();

    // Emit socket event to recipient
    socketService.emitToUser(message.recipientId, 'message_deleted', {
      messageId
    });

    ApiResponse.success(null, 'Message deleted successfully').send(res);
  });
}

module.exports = new MessageController();
