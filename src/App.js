import React from 'react';
import './App.css';
import { Admin, Resource, CustomRoutes } from 'react-admin';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
import LessonWorkPage from './lesson/LessonWorkPage';
import StudentCreatePage from './students/StudentCreatePage';

import { AuthProvider } from './AuthContext';
import { UserProvider } from './contexts/UserContext';
import AppErrorBoundary from './AppErrorBoundary';
import { RequireAuth } from './RequireAuth';

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
import LessonCreate from './lesson/LessonCreate';
import LessonEdit from './lesson/LessonEdit';
import LessonShow from './lesson/LessonShow';
import UserCreate from './users/UserCreate';

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <UserProvider>
            <AppErrorBoundary>
            <Routes>
              <Route path="/login" element={<PublicRoute><LoginRedirect /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
              <Route path="/*" element={
                <RequireAuth>
    <Admin 
      dashboard={Dashboard} 
      dataProvider={dataProvider} 
      authProvider={authProvider}
      layout={CustomLayout}
      i18nProvider={i18nProvider}
                    loginPage={false}
    >
      <CustomRoutes>
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/lesson-work" element={<LessonWorkPage />} />
        <Route path="/student-create" element={<StudentCreatePage />} />
      </CustomRoutes>

                    <Resource name="students" list={StudentList} create={StudentCreate} edit={StudentEdit} show={StudentShow} />
                    <Resource name="teachers" list={TeacherList} create={TeacherCreate} edit={TeacherEdit} show={TeacherShow} />
                    <Resource name="tariffs" list={TariffList} create={TariffCreate} edit={TariffEdit} show={TariffShow} />
                    <Resource name="lessons" list={LessonList} create={LessonCreate} edit={LessonEdit} show={LessonShow} />
                    <Resource name="users" create={UserCreate} />
    </Admin>
                </RequireAuth>
              } />
            </Routes>
          </AppErrorBoundary>
          </UserProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
