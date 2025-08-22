import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.reconnectInterval = 5000;
    this.reconnectTimer = null;
    this.subscriptions = new Map();
  }

  connect(token, onConnectCallback) {
    if (this.connected) {
      console.log('Already connected');
      return;
    }

    const socket = new SockJS('http://localhost:8080/ws-chat');
    this.stompClient = Stomp.over(socket);

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    this.stompClient.connect(headers, () => {
      this.connected = true;
      console.log('WebSocket connected');
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      if (onConnectCallback) {
        onConnectCallback();
      }
    }, (error) => {
      console.error('WebSocket connection error:', error);
      this.connected = false;
      this.scheduleReconnect(token, onConnectCallback);
    });

    this.stompClient.onDisconnect = () => {
      console.log('WebSocket disconnected');
      this.connected = false;
      this.scheduleReconnect(token, onConnectCallback);
    };
  }

  disconnect() {
    if (this.stompClient && this.connected) {
      this.stompClient.disconnect();
      this.connected = false;
      this.subscriptions.clear();
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    }
  }

  scheduleReconnect(token, onConnectCallback) {
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        console.log('Attempting to reconnect...');
        this.connect(token, onConnectCallback);
      }, this.reconnectInterval);
    }
  }

  subscribe(destination, callback) {
    if (!this.connected || !this.stompClient) {
      console.error('WebSocket not connected');
      return null;
    }

    const subscription = this.stompClient.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  unsubscribe(destination) {
    if (this.subscriptions.has(destination)) {
      const subscription = this.subscriptions.get(destination);
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  sendMessage(destination, message) {
    if (!this.connected || !this.stompClient) {
      console.error('WebSocket not connected');
      return;
    }

    this.stompClient.send(destination, {}, JSON.stringify(message));
  }

  sendChatMessage(chatRoomId, content, sender) {
    const message = {
      chatRoomId,
      content,
      sender,
      timestamp: new Date().toISOString()
    };
    this.sendMessage('/app/chat.sendMessage', message);
  }

  sendTypingIndicator(chatRoomId, username, isTyping) {
    const typingIndicator = {
      chatRoomId,
      username,
      isTyping
    };
    this.sendMessage('/app/chat.typing', typingIndicator);
  }

  sendReadReceipt(messageId, chatRoomId, username) {
    const readReceipt = {
      messageId,
      chatRoomId,
      username
    };
    this.sendMessage('/app/chat.readReceipt', readReceipt);
  }

  sendDeliveredReceipt(messageId, chatRoomId, username) {
    const deliveredReceipt = {
      messageId,
      chatRoomId,
      username
    };
    this.sendMessage('/app/chat.markDelivered', deliveredReceipt);
  }

  subscribeToChatMessages(chatRoomId, callback) {
    return this.subscribe(`/topic/chat/${chatRoomId}`, callback);
  }

  subscribeToTypingIndicators(chatRoomId, callback) {
    return this.subscribe(`/topic/chat/${chatRoomId}/typing`, callback);
  }

  subscribeToReadReceipts(chatRoomId, callback) {
    return this.subscribe(`/topic/chat/${chatRoomId}/read`, callback);
  }

  subscribeToPresenceUpdates(callback) {
    return this.subscribe('/topic/presence', callback);
  }

  isConnected() {
    return this.connected;
  }
}

export default new WebSocketService();
