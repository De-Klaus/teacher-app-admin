# Обновление часовых поясов в StudentCreatePage

## Что было изменено

### 1. Добавлено состояние для часовых поясов
```javascript
const [timeZones, setTimeZones] = useState([]);
```

### 2. Обновлена функция загрузки данных
```javascript
const [studentsRes, teachersRes, timeZonesRes] = await Promise.all([
  dataProvider.getList('students', { pagination: { page: 1, perPage: 100 } }),
  dataProvider.getList('teachers', { pagination: { page: 1, perPage: 100 } }),
  dataProvider.getTimeZones() // Новый вызов
]);

setTimeZones(timeZonesRes); // Установка часовых поясов
```

### 3. Заменен статический список на динамический
**До:**
```jsx
<MenuItem value="UTC+3">UTC+3 (Москва)</MenuItem>
<MenuItem value="UTC+5">UTC+5 (Екатеринбург)</MenuItem>
// ... статический список
```

**После:**
```jsx
{timeZones.length === 0 ? (
  <MenuItem disabled>Загрузка часовых поясов...</MenuItem>
) : (
  timeZones.map((timeZone) => (
    <MenuItem key={timeZone.value} value={timeZone.value}>
      {timeZone.label}
    </MenuItem>
  ))
)}
```

## Преимущества

✅ **Централизованное управление** - часовые пояса управляются на бэкенде
✅ **Консистентность** - одинаковые часовые пояса в TeacherCreatePage и StudentCreatePage
✅ **Динамическое обновление** - можно добавлять новые часовые пояса без изменения фронтенда
✅ **Лучший UX** - показывается индикатор загрузки

## API интеграция

- `GET /dictionary/timezones` - получение списка часовых поясов
- Использует существующий метод `dataProvider.getTimeZones()`

## Структура данных

```javascript
// Ожидаемый формат ответа от бэкенда
[
  { value: "Europe/Moscow", label: "UTC+3 (Москва)" },
  { value: "America/New_York", label: "UTC-5 (Нью-Йорк)" },
  // ...
]
```
