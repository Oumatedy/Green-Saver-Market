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
    index: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'file']
    },
    url: String,
    filename: String,
    size: Number
  }],
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
messageSchema.index({ senderId: 1, recipientId: 1, timestamp: -1 });
messageSchema.index({ recipientId: 1, status: 1 });

// Methods
messageSchema.methods.markAsRead = async function() {
  this.status = 'read';
  await this.save();
};

// Statics
messageSchema.statics.getConversation = async function(user1Id, user2Id, limit = 50, page = 1) {
  return this.find({
    $or: [
      { senderId: user1Id, recipientId: user2Id },
      { senderId: user2Id, recipientId: user1Id }
    ]
  })
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};

module.exports = mongoose.model('Message', messageSchema);
