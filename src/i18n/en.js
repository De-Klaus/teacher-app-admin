import englishMessages from 'ra-language-english';

export default {
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
  },
  custom: {
    dashboard: {
      welcome: 'Welcome, {{name}}!',
      subtitle: 'This is your admin dashboard.',
    },
  },
};