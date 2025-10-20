import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { API_URL, AUTH_TOKEN_KEY } from '../config';


class BoardWebSocketService {
  constructor() {
    this.stompClient = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
    this.subscriptions = new Map();
    this.authToken = null;
  }

  /**
   * Подключение к WebSocket серверу
   * @param {number} lessonId - ID урока
   * @param {function} onMessage - callback при получении данных
   * @param {function} onDisconnect - callback при отключении
   * @param {function} onError - callback при ошибках
   */
  connect(lessonId, onMessage, onDisconnect, onError, onConnect) {
    if (this.isConnected) {
      //console.log('WebSocket already connected');
      return;
    }

    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        console.error('No token found');
        return;
      }
      this.authToken = token;
      const socket = new SockJS(`${API_URL}/ws-board`);
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${this.authToken}`,
        },
        //debug: (str) => console.log(str),
        reconnectDelay: this.reconnectInterval,
        onConnect: () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log("✅ Connected to WebSocket");
          // Подписываемся на обновления доски
          this.subscribeToBoardUpdates(lessonId, onMessage);
          if (onConnect) onConnect();
        },
        onStompError: (frame) => {
          console.error('❌ STOMP error:', frame.headers['message']);
          if (onError) onError(frame);
        },
        onWebSocketClose: () => {
          this.isConnected = false;
          console.warn("⚠️ WebSocket disconnected");
          if (onDisconnect) onDisconnect();
        },
      });

      console.log(`🔌 Connecting to WebSocket for lesson ${lessonId}...`);
      this.stompClient.activate();
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      if (onError) onError(error);
      this.scheduleReconnect(lessonId, onMessage, onDisconnect, onError);
    }
  }

  /**
   * Подписка на обновления доски
   */
  subscribeToBoardUpdates(lessonId, onMessage) {
    // Должно соответствовать @SendTo("/topic/lesson/{lessonId}") на бэкенде
    const topic = `/topic/lessons/${lessonId}/board`;
    if (!this.stompClient || !this.isConnected) {
      console.warn('Cannot subscribe — not connected');
      return;
    }
    const subscription = this.stompClient.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        //console.log("📩 Board update received:", data);
        if (onMessage) onMessage(data);
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    });
    this.subscriptions.set(topic, subscription);
    console.log(`📡 Subscribed to board updates: ${topic}`);
  }

  /**
   * Отправка обновлений доски
   */
  sendBoardUpdate(lessonId, elements, appState) {
    if (!this.isConnected || !this.stompClient) {
      console.warn('WebSocket not connected, cannot send update');
      return;
    }

    // const updateData = {
    //   lessonId: parseInt(lessonId),
    //   elements,
    //   appState,
    //   timestamp: new Date().toISOString(),
    //   userId: localStorage.getItem('userId') || 'anonymous'
    // };

    try {
      // Отправляем через STOMP на сервер
      this.stompClient.publish({
        destination: `/app/lessons/${lessonId}/board`,
        body: JSON.stringify(elements), // Отправляем только elements для совместимости с бэкендом
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
      });

      // console.log('📤 Sent board update via STOMP:', {
      //   destination: `/app/lessons/${lessonId}/board`,
      //   elementsCount: elements.length,
      //   timestamp: updateData.timestamp
      // });
    } catch (error) {
      console.error('❌ Error sending board update via STOMP:', error);
    }
  }

  // Отключение от WebSocket
  disconnect() {
    if (this.stompClient) {
      try {
        if (typeof this.stompClient.deactivate === 'function') {
          this.stompClient.deactivate();
        } else if (typeof this.stompClient.onDisconnect === 'function') {
          this.stompClient.deactivate();
        }
      } catch (e) {
        console.warn('Error during STOMP disconnect/deactivate:', e);
      }
      this.stompClient = null;
      //console.log("🔌 WebSocket disconnected");
    }    
    // Отписываемся от всех подписок
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    this.isConnected = false;
    
    //console.log('WebSocket disconnected');
  }

  

   /**
   * Планирование переподключения
   */
  scheduleReconnect(lessonId, onMessage, onDisconnect, onError) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      if (onError) onError(new Error('Max reconnection attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    //console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${this.reconnectInterval}ms`);
    
    setTimeout(() => {
      this.connect(lessonId, onMessage, onDisconnect, onError);
    }, this.reconnectInterval);
  }

  /**
   * Получение статуса подключения
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: this.subscriptions.size
    };
  }
}

// Создаем singleton экземпляр
const boardWebSocketService = new BoardWebSocketService();
export default boardWebSocketService;
