# Исправление ESLint предупреждений

## Исправленные проблемы

### 1. `src/calendar/LessonCalendar.js`
**Проблема**: Неиспользуемые переменные `entityType` и `hasAnyRole`
```javascript
// До
const { 
  currentEntity, 
  entityType,        // ❌ не используется
  getCurrentEntity,
  hasAnyRole,       // ❌ не используется
  hasRole
} = useCurrentEntity();

// После
const { 
  currentEntity, 
  getCurrentEntity,
  hasRole
} = useCurrentEntity();
```

### 2. `src/contexts/UserContext.js`
**Проблема**: Отсутствующая зависимость `hasRole` в `useCallback`
```javascript
// До
}, [currentEntity, entityType]);

// После
}, [currentEntity, entityType, hasRole]);
```

### 3. `src/lesson/LessonWorkPage.js`
**Проблема 1**: Неиспользуемая переменная `canPerformAction`
```javascript
// До
const { 
  getCurrentEntity,
  canPerformAction,  // ❌ не используется
  getEntitySpecificData,
  hasAnyRole,
  hasRole,
  getUserRoles
} = useCurrentEntity();

// После
const { 
  getCurrentEntity,
  getEntitySpecificData,
  hasAnyRole,
  hasRole,
  getUserRoles
} = useCurrentEntity();
```

**Проблема 2**: Отсутствующая зависимость `hasRole` в `useCallback`
```javascript
// До
}, [dataProvider, notify, canSeeStudents, currentEntity, entityType, getEntitySpecificData]);

// После
}, [dataProvider, notify, canSeeStudents, currentEntity, entityType, getEntitySpecificData, hasRole]);
```

## Результат

✅ **Устранены все ESLint предупреждения**
✅ **Улучшена производительность** - удалены неиспользуемые переменные
✅ **Исправлены зависимости React hooks** - предотвращены потенциальные баги
✅ **Код стал чище** - убраны неиспользуемые импорты

## Типы исправлений

1. **no-unused-vars** - удалены неиспользуемые переменные
2. **react-hooks/exhaustive-deps** - добавлены недостающие зависимости в useCallback

Все предупреждения ESLint устранены! 🎉
