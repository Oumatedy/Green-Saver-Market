import { io } from 'socket.io-client';
import { store } from '../store';
import { setOnlineUsers } from '../store/slices/userSlice';
import { updateOrderStatus } from '../store/slices/orderSlice';
import { addMessage } from '../store/slices/chatSlice';

class SocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(userId) {
    if (this.socket?.connected) return;

    this.socket = io(process.env.VITE_BACKEND_URL || 'http://localhost:3000', {
      auth: { userId },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    this.setupEventListeners();
    this.startHeartbeat();
  }

  setupEventListeners() {
    // Connection events
    this.socket.on('connect', this.handleConnect.bind(this));
    this.socket.on('disconnect', this.handleDisconnect.bind(this));
    this.socket.on('error', this.handleError.bind(this));

    // User status events
    this.socket.on('user-status-change', this.handleUserStatusChange.bind(this));

    // Order events
    this.socket.on('order-status-update', this.handleOrderStatusUpdate.bind(this));
    this.socket.on('order-joined', this.handleOrderJoined.bind(this));

    // Product events
    this.socket.on('product-viewer-joined', this.handleProductViewerJoined.bind(this));
    this.socket.on('product-update', this.handleProductUpdate.bind(this));

    // Chat events
    this.socket.on('new-message', this.handleNewMessage.bind(this));
  }

  // Connection handlers
  handleConnect() {
    console.log('Connected to socket server');
    this.reconnectAttempts = 0;
    this.socket.emit('user-online', store.getState().auth.userId);
  }

  handleDisconnect(reason) {
    console.log('Disconnected from socket server:', reason);
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.socket.connect();
      }, 1000 * this.reconnectAttempts);
    }
  }

  handleError(error) {
    console.error('Socket error:', error);
  }

  // User status handlers
  handleUserStatusChange({ userId, status }) {
    store.dispatch(setOnlineUsers({ userId, status }));
  }

  // Order handlers
  handleOrderStatusUpdate(orderStatus) {
    store.dispatch(updateOrderStatus(orderStatus));
  }

  handleOrderJoined({ orderId }) {
    console.log('Joined order room:', orderId);
  }

  // Product handlers
  handleProductViewerJoined({ productId, viewerCount }) {
    // Update product viewer count in store if needed
    console.log(`Product ${productId} has ${viewerCount} viewers`);
  }

  handleProductUpdate(product) {
    // Update product in store
    console.log('Product updated:', product);
  }

  // Chat handlers
  handleNewMessage(message) {
    store.dispatch(addMessage(message));
  }

  // Room management
  joinProductRoom(productId) {
    this.socket?.emit('join-product', productId);
  }

  joinOrderRoom(orderId) {
    this.socket?.emit('join-order', orderId);
  }

  // Chat methods
  sendMessage(recipientId, message) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to socket server'));
        return;
      }

      this.socket.emit('send-message', { recipientId, message }, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  // Heartbeat to maintain presence
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat');
      }
    }, 30000); // Every 30 seconds
  }

  // Cleanup
  disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
