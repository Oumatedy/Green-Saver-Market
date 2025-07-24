const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'file'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  name: String,
  size: Number,
  mimeType: String
}, { _id: false });

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: [attachmentSchema],
  read: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Create compound indexes for querying conversations
messageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });
messageSchema.index({ recipientId: 1, read: 1 });

// Add instance methods if needed
messageSchema.methods.markAsRead = async function() {
  this.read = true;
  return this.save();
};

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
