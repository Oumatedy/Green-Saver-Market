import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useChat } from '../hooks/useSocket';
import { fetchMessages, markConversationAsRead } from '../store/slices/chatSlice';
import { format } from 'date-fns';

const ChatMessage = ({ message, isOwn }) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
    <div
      className={`rounded-lg px-4 py-2 max-w-[70%] ${
        isOwn
          ? 'bg-green-500 text-white'
          : 'bg-gray-100 text-gray-900'
      }`}
    >
      <p className="text-sm">{message.content}</p>
      <span className="text-xs opacity-75">
        {format(new Date(message.timestamp), 'HH:mm')}
      </span>
    </div>
  </div>
);

const ChatInput = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-white">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-green-500"
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="bg-green-500 text-white rounded-full p-2 hover:bg-green-600 disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>
      </div>
    </form>
  );
};

const Chat = ({ recipientId, recipientName }) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const [page, setPage] = useState(1);
  const userId = useSelector(state => state.auth.userId);
  const messages = useSelector(state => {
    const conversationId = userId < recipientId 
      ? `${userId}-${recipientId}` 
      : `${recipientId}-${userId}`;
    return state.chat.messages[conversationId] || [];
  });
  
  const { sendMessage, sending, error } = useChat(recipientId);

  useEffect(() => {
    dispatch(fetchMessages({ userId, otherUserId: recipientId, page }));
  }, [dispatch, userId, recipientId, page]);

  useEffect(() => {
    dispatch(markConversationAsRead(recipientId));
  }, [dispatch, recipientId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0) {
      setPage(prev => prev + 1);
    }
  };

  const handleSend = async (content) => {
    try {
      await sendMessage(content);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b px-4 py-3">
        <h2 className="text-lg font-semibold">{recipientName}</h2>
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded">
            {error}
          </div>
        )}

        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            isOwn={message.senderId === userId}
          />
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={sending} />
    </div>
  );
};

export default Chat;
