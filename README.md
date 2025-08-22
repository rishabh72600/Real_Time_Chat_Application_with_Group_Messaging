# Real-Time Chat Application with Group Messaging

A full-stack real-time chat application built with Spring Boot (backend) and React (frontend) that supports private and group messaging with WebSocket communication.

## Features

-  **Real-time messaging** using WebSocket (STOMP over SockJS)
-  **Private and group chats** support
-  **User authentication** with JWT
-  **User presence** (online/offline/typing indicators)
-  **File sharing** (images, documents, media)
-  **Message history** with MongoDB persistence
-  **Read receipts** and delivery confirmation
-  **Message editing** capabilities
-  **Emoji support**
-  **Responsive UI** with React

## Tech Stack

### Backend
- **Spring Boot 3.2.0** - Java framework
- **WebSocket** - Real-time communication
- **MongoDB** - NoSQL database
- **JWT** - Authentication
- **Spring Security** - Security framework

### Frontend
- **React 18** - UI framework
- **Socket.IO Client** - WebSocket client
- **React Router** - Navigation
- **Styled Components** - Styling
- **Axios** - HTTP client

## Project Structure

```
Real-Time Chat Application/
├── backend/
│   ├── src/main/java/com/chatapp/
│   │   ├── config/          # WebSocket & Security config
│   │   ├── controller/      # REST & WebSocket controllers
│   │   ├── model/          # MongoDB documents
│   │   ├── repository/     # Data repositories
│   │   ├── service/        # Business logic
│   │   └── security/       # JWT & Security
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml             # Maven dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API & WebSocket services
│   │   ├── contexts/      # React contexts
│   │   └── utils/         # Utility functions
│   ├── public/
│   └── package.json       # NPM dependencies
└── README.md
```

## Quick Start

### Prerequisites
- Java 17+
- Node.js 16+
- MongoDB 5.0+
- Maven 3.6+

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   mvn clean install
   ```

3. Start MongoDB service

4. Run the application:
   ```bash
   mvn spring-boot:run
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Chat
- `GET /api/chat/rooms` - Get user's chat rooms
- `POST /api/chat/rooms` - Create new chat room
- `GET /api/chat/rooms/{id}/messages` - Get message history
- `POST /api/chat/rooms/{id}/messages` - Send message
- `PUT /api/chat/messages/{id}` - Edit message

### WebSocket Endpoints
- `/ws-chat` - WebSocket connection endpoint
- `/app/chat.send` - Send message
- `/app/chat.typing` - Typing indicator
- `/topic/chat/{roomId}` - Room-specific messages
- `/user/queue/messages` - Private messages

## Database Schema

### Collections
- **users** - User information
- **chat_rooms** - Chat room details
- **messages** - All messages

### Indexes
