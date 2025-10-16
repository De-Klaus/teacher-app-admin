import englishMessages from 'ra-language-english';

const englishTranslations = {
  ...englishMessages,
  ra: {
    ...englishMessages.ra,
    auth: {
      ...englishMessages.ra?.auth,
      email: 'Email',
      password: 'Password',
      sign_in: 'Sign in',
      logout: 'Logout',
      sign_in_error: 'Authentication failed, please retry',
      user_menu: 'Profile',
    },
  },
  app: {
    name: 'Smart platform for teachers and students',
  },
  errors: {
    server_access_denied: 'Server error: The server encountered an internal error. Access Denied. Please try again later or contact support.',
  },
  resources: {
    students: {
      name: 'Student |||| Students',
      fields: {
        name: 'Name',
        age: 'Age',
      },
    },
    teachers: {
      name: 'Teacher |||| Teachers',
      fields: {
        name: 'Name',
        subject: 'Subject',
      },
    },
    tariffs: {
      name: 'Tariff |||| Tariffs',
      fields: {
        name: 'Name',
        price: 'Price',
      },
    },
    lessons: {
      name: 'Lesson |||| Lessons',
    },
  },
  menu: {
    users: 'Users',
    lessons: 'Lessons & Tariffs',
    settings: 'Settings',
    dashboard: 'Dashboard',
    calendar: 'Calendar',
    lesson: 'Lessons',
    registerUser: 'Register User',
  },
  page: {
    dashboard: 'Welcome',
    dashboardSubtitle: 'This is your admin dashboard. Here you can manage students, teachers and tariffs.',
    quickStats: 'Quick Statistics',
    totalStudents: 'Total Students',
    activeTeachers: 'Active Teachers',
    availableTariffs: 'Available Tariffs',
    totalLessons: 'Total Lessons',
    calendar: 'Calendar',
  },
  custom: {
    dashboard: {
      welcome: 'Welcome, {{name}}!',
      subtitle: 'This is your admin dashboard.',
    },
  },
};

export default englishTranslations;