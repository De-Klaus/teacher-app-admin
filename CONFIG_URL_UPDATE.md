# Обновление URL конфигурации

## Что было изменено

### Проблема
В `RegisterByTokenPage.js` использовались хардкодные URL:
```javascript
// До
const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/register?token=${tokenValue}`, {
const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/users/register-by-token?token=${token}`, {
```

### Решение
Заменили на использование глобального базового URL из конфигурации:
```javascript
// После
import { API_URL } from '../config';

const response = await fetch(`${API_URL}/register?token=${tokenValue}`, {
const response = await fetch(`${API_URL}/users/register-by-token?token=${token}`, {
```

## Преимущества

✅ **Централизованная конфигурация** - все URL управляются из одного места
✅ **Легкость изменения** - достаточно изменить `API_URL` в `config.js`
✅ **Консистентность** - все компоненты используют одинаковый базовый URL
✅ **Упрощение развертывания** - легко переключаться между средами

## Файлы
- `src/auth/RegisterByTokenPage.js` - обновлен для использования `API_URL`
- `src/config.js` - содержит глобальную конфигурацию

## Использование
```javascript
import { API_URL } from '../config';

// Вместо хардкодных URL
const response = await fetch(`${API_URL}/endpoint`);
```

Теперь все API вызовы используют централизованную конфигурацию! 🎯
