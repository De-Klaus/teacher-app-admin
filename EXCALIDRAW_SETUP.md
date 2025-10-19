# 🎨 Excalidraw Setup Guide

## 📋 Обзор
Этот документ описывает настройку Excalidraw с WebSocket для real-time обновлений доски, привязанной к урокам.

## 🚀 Быстрый старт

### 1. Установка пакетов
```bash
# Установка Excalidraw и WebSocket библиотек
npm install @excalidraw/excalidraw @stomp/stompjs sockjs-client --legacy-peer-deps

# Если возникают проблемы с зависимостями, попробуйте:
npm install @excalidraw/excalidraw @stomp/stompjs sockjs-client --legacy-peer-deps --force
```

### 2. Обновление компонента
После установки пакетов замените заглушку в `src/pages/LessonBoard/LessonBoardPage.jsx`:

```jsx
// Замените эту строку:
// import { Excalidraw } from '@excalidraw/excalidraw';

// На эту:
import { Excalidraw } from '@excalidraw/excalidraw';
```

И замените `ExcalidrawPlaceholder` на настоящий `Excalidraw`:

```jsx
// Замените:
<ExcalidrawPlaceholder
  ref={excalidrawRef}
  onChange={handleExcalidrawChange}
/>

// На:
<Excalidraw
  ref={excalidrawRef}
  onChange={handleExcalidrawChange}
  theme="light"
  name={`Lesson ${lessonId} Board`}
/>
```

## 🔧 Архитектура решения

### Frontend (React)
```
src/pages/LessonBoard/
├── LessonBoardPage.jsx          # Основной компонент
├── LessonBoardPageWithExcalidraw.jsx  # Версия с настоящим Excalidraw
└── boardWebSocketService.js     # WebSocket сервис

src/services/
└── boardWebSocketService.js     # WebSocket для real-time обновлений
```

### API Endpoints
- `POST /api/lessons/{lessonId}/board/save` - сохранение состояния доски
- `GET /api/lessons/{lessonId}/board/load` - загрузка состояния доски
- `WebSocket /ws-board` - real-time обновления

## 🌐 WebSocket Integration

### Подключение к WebSocket
```javascript
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const stompClient = new Client({
  webSocketFactory: () => new SockJS('/ws-board'),
  debug: (str) => console.log(str),
  onConnect: () => {
    console.log('WebSocket connected');
    // Подписываемся на обновления доски
    stompClient.subscribe(`/topic/lessons/${lessonId}/board`, (message) => {
      const update = JSON.parse(message.body);
      // Обновляем доску
      excalidrawRef.current.updateScene({ elements: update.elements });
    });
  },
  onStompError: (frame) => {
    console.error('WebSocket error:', frame);
  }
});
```

### Отправка обновлений
```javascript
const sendBoardUpdate = (elements, appState) => {
  const updateData = {
    lessonId: parseInt(lessonId),
    elements,
    appState,
    timestamp: new Date().toISOString()
  };
  
  stompClient.publish({
    destination: `/app/lessons/${lessonId}/board`,
    body: JSON.stringify(updateData)
  });
};
```

## 🎯 Функционал

### ✅ Реализовано
- **Полноэкранная доска** (height: 100vh)
- **Кнопка "Сохранить"** с отправкой на REST API
- **WebSocket подключение** для real-time обновлений
- **Автоматическая загрузка** состояния доски при открытии
- **Обработка изменений** с отправкой через WebSocket
- **Красивый UI** с Material-UI компонентами
- **Обработка ошибок** и уведомления

### 🔄 Real-time обновления
- При изменении доски отправляются обновления через WebSocket
- Все пользователи видят изменения в реальном времени
- Автоматическое переподключение при потере соединения

### 💾 Сохранение и загрузка
- Состояние доски сохраняется в PostgreSQL (JSONB)
- Автоматическая загрузка при открытии урока
- Ручное сохранение через кнопку "Сохранить"

## 🚀 Использование

### Для пользователей:
1. Перейти в раздел "Работа с уроками"
2. Нажать кнопку "🎨 Доска" для любого урока
3. Рисовать на доске (изменения синхронизируются в реальном времени)
4. Использовать кнопку "Сохранить" для сохранения состояния
5. Нажать "←" для возврата к урокам

### Для разработчиков:
1. Установить пакеты: `npm install @excalidraw/excalidraw @stomp/stompjs sockjs-client --legacy-peer-deps`
2. Заменить заглушку на настоящий Excalidraw
3. Настроить Spring Boot бэкенд с WebSocket поддержкой
4. Протестировать real-time обновления

## 🔧 Настройка Spring Boot

### WebSocket Configuration
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-board")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
```

### WebSocket Controller
```java
@Controller
public class BoardWebSocketController {
    
    @MessageMapping("/lessons/{lessonId}/board")
    @SendTo("/topic/lessons/{lessonId}/board")
    public BoardUpdateMessage handleBoardUpdate(
            @DestinationVariable Long lessonId,
            BoardUpdateMessage message) {
        
        // Сохраняем изменения в базу данных
        boardService.saveBoard(lessonId, message.getElements());
        
        // Рассылаем обновления всем подключенным пользователям
        return message;
    }
}
```

## 🎉 Результат

После выполнения всех шагов у вас будет:
- ✅ Полнофункциональная доска Excalidraw
- ✅ Real-time синхронизация между пользователями
- ✅ Сохранение состояния в базе данных
- ✅ Красивый и интуитивный интерфейс
- ✅ Интеграция с существующей системой уроков

## 🐛 Troubleshooting

### Проблемы с установкой пакетов
```bash
# Очистите кэш npm
npm cache clean --force

# Удалите node_modules и package-lock.json
rm -rf node_modules package-lock.json

# Переустановите зависимости
npm install
npm install @excalidraw/excalidraw @stomp/stompjs sockjs-client --legacy-peer-deps
```

### Проблемы с WebSocket
- Проверьте, что Spring Boot бэкенд запущен
- Убедитесь, что CORS настроен правильно
- Проверьте консоль браузера на ошибки WebSocket

### Проблемы с Excalidraw
- Убедитесь, что пакет установлен корректно
- Проверьте импорты в компоненте
- Убедитесь, что ref передается правильно
