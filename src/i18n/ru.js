// src/i18n/ru.js
import russianMessages from 'ra-language-russian';

export default {
  ...russianMessages,
  ra: {
    ...russianMessages.ra,
    auth: {
      ...russianMessages.ra?.auth,
      email: 'Email',
      password: 'Пароль',
      sign_in: 'Войти',
      logout: 'Выйти',
      sign_in_error: 'Ошибка авторизации, проверьте данные',
      user_menu: 'Профиль',
    },
  },
  app: {
    name: 'Умная платформа для учителей и учеников',
  },
  errors: {
    server_access_denied: 'Ошибка сервера: Доступ запрещён. Пожалуйста, попробуйте позже или обратитесь в поддержку.',
  },
  resources: {
    students: {
      name: 'Ученик |||| Ученики',
    },
    teachers: {
      name: 'Учитель |||| Учителя',
    },
    tariffs: {
      name: 'Тариф |||| Тарифы',
    },
    lessons: {
      name: "Уроки"
    },
  },
  menu: {
    users: 'Ученики и Учителя',
    lessons: 'Уроки и Тарифы',
    settings: 'Настройки',
    dashboard: 'Главная',
    calendar: 'Календарь',
    lesson: 'Уроки',
    registerUser: 'Регистрация пользователя',
  },
  page: {
    dashboard: 'Добро пожаловать',
    dashboardSubtitle: 'Это ваша панель администратора. Здесь вы можете управлять учениками, учителями и тарифами.',
    quickStats: 'Быстрая статистика',
    totalStudents: 'Всего учеников',
    activeTeachers: 'Активных учителей',
    availableTariffs: 'Доступных тарифов',
  },
};
