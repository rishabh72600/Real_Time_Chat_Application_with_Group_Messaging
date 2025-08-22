import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import webSocketService from '../services/WebSocketService';
import { format } from 'date-fns';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const ChatHeader = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 15px 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ChatTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
`;

const UserStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatusIndicator = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.status === 'ONLINE' ? '#4CAF50' : '#f44336'};
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
`;

const MessageGroup = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 18px;
  background: ${props => props.isOwn ? '#667eea' : 'rgba(255, 255, 255, 0.2)'};
  color: white;
  word-wrap: break-word;
`;

const MessageInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
`;

const Checkmark = styled.span`
  color: ${props => props.read ? '#4CAF50' : 'rgba(255, 255, 255, 0.5)'};
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 15px;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
`;

const ChatInputContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 15px 20px;
  display: flex;
  gap: 10px;
  align-items: center;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1rem;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.3);
  }
`;

const SendButton = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  background: #667eea;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;

  &:hover {
    background: #764ba2;
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.2);
    cursor: not-allowed;
  }
`;

const EnhancedChatPage = ({ chatRoomId = "general", currentUser = "user" }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem('token') || 'dummy-token';
    
    webSocketService.connect(token, () => {
      setIsConnected(true);
      
      webSocketService.subscribeToChatMessages(chatRoomId, (message) => {
        setMessages(prev => [...prev, {
          id: message.id,
          content: message.content,
          sender: message.senderId,
          timestamp: message.createdAt,
          readBy: message.readBy || [],
          deliveredTo: message.deliveredTo || []
        }]);
        
        if (message.senderId !== currentUser) {
          webSocketService.sendDeliveredReceipt(message.id, chatRoomId, currentUser);
        }
      });

      webSocketService.subscribeToTypingIndicators(chatRoomId, (typingData) => {
        if (typingData.username !== currentUser) {
          if (typingData.isTyping) {
            setTypingUsers(prev => [...new Set([...prev, typingData.username])]);
          } else {
            setTypingUsers(prev => prev.filter(user => user !== typingData.username));
          }
        }
      });

      webSocketService.subscribeToReadReceipts(chatRoomId, (readReceipt) => {
        setMessages(prev => prev.map(msg => 
          msg.id === readReceipt.messageId 
            ? { ...msg, readBy: [...msg.readBy, readReceipt.username] }
            : msg
        ));
      });
    });

    return () => {
      webSocketService.disconnect();
    };
  }, [chatRoomId, currentUser]);

  const handleSendMessage = () => {
    if (inputValue.trim() && isConnected) {
      webSocketService.sendChatMessage(chatRoomId, inputValue, currentUser);
      setInputValue('');
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      webSocketService.sendTypingIndicator(chatRoomId, currentUser, false);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    webSocketService.sendTypingIndicator(chatRoomId, currentUser, true);
    
    typingTimeoutRef.current = setTimeout(() => {
      webSocketService.sendTypingIndicator(chatRoomId, currentUser, false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch {
      return timestamp;
    }
  };

  const getMessageStatus = (message) => {
    if (message.sender !== currentUser) return null;
    
    if (message.readBy.length > 0) {
      return <Checkmark read>✓✓</Checkmark>;
    } else if (message.deliveredTo.length > 0) {
      return <Checkmark>✓✓</Checkmark>;
    } else {
      return <Checkmark>✓</Checkmark>;
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>Chat Room: {chatRoomId}</ChatTitle>
        <UserStatus>
          <span>Status: </span>
          <StatusIndicator status={isConnected ? 'ONLINE' : 'OFFLINE'} />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </UserStatus>
      </ChatHeader>

      <ChatMessages>
        {messages.map((message) => (
          <MessageGroup key={message.id} isOwn={message.sender === currentUser}>
            <MessageBubble isOwn={message.sender === currentUser}>
              {message.content}
            </MessageBubble>
            <MessageInfo>
              <span>{formatMessageTime(message.timestamp)}</span>
              {getMessageStatus(message)}
            </MessageInfo>
          </MessageGroup>
        ))}
        
        {typingUsers.length > 0 && (
          <TypingIndicator>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </TypingIndicator>
        )}
        
        <div ref={messagesEndRef} />
      </ChatMessages>

      <ChatInputContainer>
        <ChatInput
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={!isConnected}
        />
        <SendButton onClick={handleSendMessage} disabled={!isConnected || !inputValue.trim()}>
          Send
        </SendButton>
      </ChatInputContainer>
    </ChatContainer>
  );
};

export default EnhancedChatPage;
