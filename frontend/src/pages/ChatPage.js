import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const ChatHeader = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  color: white;
  text-align: center;
`;

const ChatMessages = styled.div`
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  overflow-y: auto;
`;

const ChatInput = styled.div`
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 10px;
`;

const ChatInputField = styled.input`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  placeholder: #ccc;
`;

const ChatButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background: #667eea;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #764ba2;
  }
`;

const ChatMessage = styled.div`
  margin-bottom: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  color: white;
`;

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { text: inputValue, sender: 'user' }]);
      setInputValue('');
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <h1>Real-Time Chat Application</h1>
      </ChatHeader>
      <ChatMessages>
        {messages.map((message, index) => (
          <ChatMessage key={index}>{message.text}</ChatMessage>
        ))}
      </ChatMessages>
      <ChatInput>
        <ChatInputField
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
        />
        <ChatButton onClick={handleSendMessage}>Send</ChatButton>
      </ChatInput>
    </ChatContainer>
  );
};

export default ChatPage;
