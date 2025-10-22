# Исправление ошибки STOMP disconnect

## Проблема
```
stompClientRef.current.disconnect is not a function
TypeError: stompClientRef.current.disconnect is not a function
```

## Причина
В новых версиях библиотеки `@stomp/stompjs` метод `disconnect()` был заменен на `deactivate()`.

## Решение

### 1. Обновлена функция disconnectWebSocket
```javascript
// До
const disconnectWebSocket = useCallback(() => {
  if (stompClientRef.current) {
    stompClientRef.current.disconnect(); // ❌ Ошибка
    stompClientRef.current = null;
  }
  // ...
}, []);

// После
const disconnectWebSocket = useCallback(() => {
  if (stompClientRef.current) {
    try {
      // В новых версиях @stomp/stompjs используется deactivate() вместо disconnect()
      if (typeof stompClientRef.current.deactivate === 'function') {
        stompClientRef.current.deactivate(); // ✅ Новый метод
      } else if (typeof stompClientRef.current.disconnect === 'function') {
        stompClientRef.current.disconnect(); // ✅ Fallback для старых версий
      }
    } catch (error) {
      console.warn('Error disconnecting WebSocket:', error);
    }
    stompClientRef.current = null;
  }
  // ...
}, []);
```

### 2. Добавлена проверка перед отправкой сообщений
```javascript
// До
stompClientRef.current.publish({...});

// После
if (stompClientRef.current && typeof stompClientRef.current.publish === 'function') {
  stompClientRef.current.publish({...});
}
```

### 3. Безопасное отключение в useEffect
```javascript
// До
return () => {
  disconnectWebSocket();
};

// После
return () => {
  // Безопасное отключение при размонтировании компонента
  if (stompClientRef.current) {
    disconnectWebSocket();
  }
};
```

## Преимущества решения

✅ **Обратная совместимость** - работает с разными версиями @stomp/stompjs
✅ **Безопасность** - проверки существования методов перед вызовом
✅ **Обработка ошибок** - try-catch блоки для предотвращения крашей
✅ **Логирование** - предупреждения в консоли для отладки

## Результат

Теперь WebSocket отключение работает корректно с любой версией @stomp/stompjs! 🚀
