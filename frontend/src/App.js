import React from 'react';
import styled from 'styled-components';
import ChatPage from './pages/ChatPage';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

function App() {
  return (
    <AppContainer>
      <ChatPage />
    </AppContainer>
  );
}

export default App;
