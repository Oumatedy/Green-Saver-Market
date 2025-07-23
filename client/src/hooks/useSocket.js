import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socketService from '../services/socketService';
import { addMessage, updateUserStatus } from '../store/slices/chatSlice';
import { updateOrderStatus } from '../store/slices/orderSlice';

export const useSocket = (userId) => {
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (userId) {
      socketService.connect(userId);
      setIsConnected(true);
    }

    return () => {
      socketService.disconnect();
      setIsConnected(false);
    };
  }, [userId]);

  return { isConnected };
};

export const useChat = (recipientId) => {
  const dispatch = useDispatch();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (content) => {
    try {
      setSending(true);
      setError(null);
      await socketService.sendMessage(recipientId, content);
      setSending(false);
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }, [recipientId]);

  return { sendMessage, sending, error };
};

export const useOrderUpdates = (orderId) => {
  const dispatch = useDispatch();
  const orderStatus = useSelector(state => state.orders.items[orderId]?.status);

  useEffect(() => {
    if (orderId) {
      socketService.joinOrderRoom(orderId);
    }
  }, [orderId]);

  return { orderStatus };
};

export const useProductRoom = (productId) => {
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    if (productId) {
      socketService.joinProductRoom(productId);
    }

    const handleViewerUpdate = ({ viewerCount: count }) => {
      setViewerCount(count);
    };

    socketService.socket?.on('product-viewer-joined', handleViewerUpdate);

    return () => {
      socketService.socket?.off('product-viewer-joined', handleViewerUpdate);
    };
  }, [productId]);

  return { viewerCount };
};
