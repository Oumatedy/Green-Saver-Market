import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations } from '../store/slices/chatSlice';
import Chat from '../components/Chat';

const ConversationList = ({ conversations, activeId, onSelect }) => (
  <div className="border-r h-full overflow-y-auto">
    {conversations.map((conv) => (
      <div
        key={conv.userId}
        onClick={() => onSelect(conv.userId)}
        className={`p-4 cursor-pointer hover:bg-gray-50 ${
          activeId === conv.userId ? 'bg-gray-100' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              {conv.name[0].toUpperCase()}
            </div>
            {conv.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{conv.name}</h3>
            <p className="text-sm text-gray-500 truncate">
              {conv.lastMessage}
            </p>
          </div>
          {conv.unreadCount > 0 && (
            <div className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {conv.unreadCount}
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

const ChatContainer = () => {
  const dispatch = useDispatch();
  const [activeConversation, setActiveConversation] = useState(null);
  const conversations = useSelector(state => state.chat.conversations);
  const userId = useSelector(state => state.auth.userId);

  useEffect(() => {
    if (userId) {
      dispatch(fetchConversations(userId));
    }
  }, [dispatch, userId]);

  const handleSelect = (recipientId) => {
    setActiveConversation(recipientId);
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="w-80">
        <ConversationList
          conversations={conversations}
          activeId={activeConversation}
          onSelect={handleSelect}
        />
      </div>
      <div className="flex-1">
        {activeConversation ? (
          <Chat
            recipientId={activeConversation}
            recipientName={
              conversations.find(c => c.userId === activeConversation)?.name
            }
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
