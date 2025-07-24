/**
 * Message schema for user-to-user messaging, 
 * with support for text content, attachments, read status, and timestamps.
 */

const mongoose = require('mongoose');

/**
 * Attachment sub-schema to support images or files attached to messages.
 * Stores type, url, filename, size in bytes, and MIME type.
 */
const attachmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'file'],
    required: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  size: {
    type: Number,
    min: 0,
  },
  mimeType: {
    type: String,
    trim: true,
  },
}, { _id: false });

/**
 * Core Message schema linking sender and receiver users,
 * content string, attachments array, read status and timestamps.
 */
const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000, // limit max length (adjust as needed)
  },
  attachments: {
    type: [attachmentSchema],
    default: [],
  },
  read: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true, // createdAt and updatedAt managed automatically
});

/**
 * Compound indexes to efficiently query conversations:
 *  - To fetch messages between sender and recipient sorted by creation date DESC
 *  - To fetch unread messages for a recipient
 */
messageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });
messageSchema.index({ recipientId: 1, read: 1 });

/**
 * Instance method to mark message as read
 */
messageSchema.methods.markAsRead = async function () {
  if (!this.read) {
    this.read = true;
    await this.save();
  }
  return this;
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
