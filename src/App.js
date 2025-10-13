import React from "react";
import './App.css';
import { Admin, Resource } from 'react-admin';
import { CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import dataProvider from './dataProvider';
import authProvider from './authProvider';
import i18nProvider from './i18nProvider';
import theme from './theme';
import CustomLayout from './CustomLayout';
import Dashboard from './Dashboard';
import LoginRedirect from './LoginRedirect';
import PublicRoute from './components/PublicRoute';
import RegisterPage from './auth/RegisterPage';

import CalendarPage from './calendar/CalendarPage';

import StudentList from './students/StudentList';
import StudentCreate from './students/StudentCreate';
import StudentEdit from './students/StudentEdit';
import StudentShow from './students/StudentShow';

import TeacherList from './teachers/TeacherList';
import TeacherCreate from './teachers/TeacherCreate';
import TeacherEdit from './teachers/TeacherEdit';
import TeacherShow from './teachers/TeacherShow';

import TariffList from './tariffs/TariffList';
import TariffCreate from './tariffs/TariffCreate';
import TariffEdit from './tariffs/TariffEdit';
import TariffShow from './tariffs/TariffShow';

import LessonList from './lesson/LessonList';
import LessonEdit from './lesson/LessonEdit';
import LessonShow from './lesson/LessonShow';
import LessonCreate from './lesson/LessonCreate';
import LessonWorkPage from './lesson/LessonWorkPage';
import UserCreate from './users/UserCreate';

// LoginPage удален - используется LoginRedirect вместо него

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <Admin 
      dashboard={Dashboard} 
      dataProvider={dataProvider} 
      authProvider={authProvider}
      layout={CustomLayout}
      i18nProvider={i18nProvider}
        loginPage={LoginRedirect}
    >
      <CustomRoutes>
            <Route path="/register" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } />
        <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/lesson-work" element={<LessonWorkPage />} />
      </CustomRoutes>
      <Resource
          name="students"
          options={{ label: 'resources.students.name' }}
          list={StudentList}
          create={StudentCreate}
          edit={StudentEdit}
          show={StudentShow}
      />
      <Resource
          name="teachers"
          list={TeacherList}
          create={TeacherCreate}
          edit={TeacherEdit}
          show={TeacherShow}
      />
      <Resource 
            name="tariffs" 
            list={TariffList} 
            create={TariffCreate} 
            edit={TariffEdit} 
            show={TariffShow} />
      <Resource
          name="lessons"
          list={LessonList}
          create={LessonCreate}
          edit={LessonEdit}
          show={LessonShow} />
      <Resource
          name="users"
          create={UserCreate}
      />
    </Admin>
    </ThemeProvider>
  );
};

export default App;