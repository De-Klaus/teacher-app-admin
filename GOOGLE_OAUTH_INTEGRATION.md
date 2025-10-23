# Google OAuth2 и Calendar Integration

## 📋 Обзор

Полная интеграция Google OAuth2 авторизации и синхронизации календаря с Spring Boot backend.

## 🎯 Реализованный функционал

### 1️⃣ Авторизация через Google OAuth2

#### Компоненты:
- **`GoogleLoginButton.js`** - Кнопка входа через Google
  - Сохраняет текущий URL для редиректа после авторизации
  - Перенаправляет на `/oauth2/authorization/google`
  - Красивый дизайн с градиентом Google цветов

- **`GoogleOAuth2Callback.js`** - Обработчик OAuth2 callback
  - Обрабатывает успешную авторизацию
  - Сохраняет JWT токены в localStorage
  - Перенаправляет пользователя на сохраненный URL
  - Обработка ошибок авторизации

### 2️⃣ Синхронизация Google Calendar

#### Компоненты:
- **`GoogleCalendarSync.js`** - Компонент синхронизации
  - ✅ Проверка подключения к Google аккаунту
  - ✅ Кнопка ручной синхронизации
  - ✅ Автоматическая синхронизация каждые 10 минут
  - ✅ Отображение времени последней синхронизации
  - ✅ Возможность отключения Google аккаунта
  - ✅ Статус индикаторы (подключен/не подключен)

### 3️⃣ API Integration (dataProvider)

#### Новые методы:
```javascript
// Синхронизация календаря
syncGoogleCalendar(userId)

// Проверка подключения
checkGoogleConnection(userId)

// Отключение аккаунта
disconnectGoogle(userId)
```

### 4️⃣ UI/UX Обновления

#### CalendarPage:
- Интеграция `GoogleCalendarSync` компонента
- Автоматическое обновление событий после синхронизации
- Красивый дизайн с FuturisticBackground
- Карточка синхронизации с иконками и статусами

## 🔧 Backend Endpoints

### OAuth2:
```
GET /oauth2/authorization/google - Инициация Google OAuth2
GET /auth/oauth2/success - Callback после успешной авторизации
```

### Google Calendar API:
```
GET /api/google/calendar/sync?userId={userId} - Синхронизация календаря
GET /api/google/calendar/connected?userId={userId} - Проверка подключения
POST /api/google/disconnect?userId={userId} - Отключение Google
POST /api/google/calendar/notifications - Webhook для Google push уведомлений
```

## 📱 Использование

### Для пользователей:

1. **Авторизация через Google:**
   ```jsx
   <GoogleLoginButton />
   ```

2. **На странице календаря:**
   - Нажать "Войти через Google" (если не подключен)
   - Разрешить доступ к Google Calendar
   - Нажать "Синхронизировать" для ручного обновления
   - События автоматически синхронизируются каждые 10 минут

3. **Отключение Google:**
   - Нажать кнопку "Отключить"
   - Подтвердить в диалоговом окне

### Для разработчиков:

#### Интеграция кнопки Google в другие компоненты:
```javascript
import GoogleLoginButton from './components/GoogleLoginButton';

<GoogleLoginButton 
  sx={{ margin: '1em' }} 
  onSuccess={() => console.log('Logged in!')} 
/>
```

#### Использование синхронизации:
```javascript
import GoogleCalendarSync from './calendar/GoogleCalendarSync';

<GoogleCalendarSync 
  onSyncComplete={(events) => {
    console.log('Synced events:', events);
    // Обновить UI
  }} 
/>
```

#### Прямые вызовы API:
```javascript
import { useDataProvider } from 'react-admin';

const dataProvider = useDataProvider();

// Синхронизация
const events = await dataProvider.syncGoogleCalendar(userId);

// Проверка подключения
const status = await dataProvider.checkGoogleConnection(userId);

// Отключение
await dataProvider.disconnectGoogle(userId);
```

## 🔐 Безопасность

- ✅ JWT токены хранятся в `localStorage`
- ✅ Все запросы используют `Authorization: Bearer {token}`
- ✅ Google access/refresh токены хранятся только на backend
- ✅ Push уведомления от Google обрабатываются только на backend

## 🎨 UI/UX Features

### GoogleLoginButton:
- 🎨 Градиент Google цветов (#4285f4 → #34a853)
- 🖱️ Hover эффекты с трансформацией
- 📱 Адаптивный дизайн

### GoogleCalendarSync:
- 🟢 Зеленый индикатор - подключен
- ⚫ Серый индикатор - не подключен
- ⏰ Время последней синхронизации
- 🔄 Анимация загрузки при синхронизации
- 💬 Информационные сообщения и алерты

### CalendarPage:
- 🎨 FuturisticBackground
- 🃏 Карточки с blur эффектом
- 📅 Интегрированный React Big Calendar
- 🔗 Секция синхронизации сверху

## 🚀 Автоматизация

### Автоматическая синхронизация:
```javascript
// Каждые 10 минут (если подключен Google)
useEffect(() => {
  if (isConnected) {
    const interval = setInterval(() => {
      handleSync();
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }
}, [isConnected]);
```

### Push уведомления:
- Backend получает webhook от Google на `/api/google/calendar/notifications`
- Автоматически обновляет события в БД
- Frontend получает обновления при следующей синхронизации

## 📁 Структура файлов

```
src/
├── components/
│   └── GoogleLoginButton.js ✨ NEW
├── auth/
│   ├── RegisterByTokenPage.js
│   └── GoogleOAuth2Callback.js ✨ NEW
├── calendar/
│   ├── CalendarPage.js ✅ UPDATED
│   ├── LessonCalendar.js
│   └── GoogleCalendarSync.js ✨ NEW
├── config.js ✅ UPDATED
├── dataProvider.js ✅ UPDATED
└── App.js ✅ UPDATED
```

## ✅ Результат

Теперь приложение полностью интегрировано с Google:
- 🔐 OAuth2 авторизация
- 📅 Двусторонняя синхронизация календаря
- 🔄 Автоматические обновления
- 📲 Push уведомления (backend)
- 🎨 Красивый UI/UX
- 🛡️ Безопасная работа с токенами

Готово к использованию! 🎉
