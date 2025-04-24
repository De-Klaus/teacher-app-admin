import React from "react";
import { Admin, Resource } from 'react-admin';
import { CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';
import dataProvider from './dataProvider';
import i18nProvider from './i18nProvider';
import CustomLayout from './CustomLayout';
import Dashboard from './Dashboard';

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

const App = () => (
  <Admin 
  dashboard={Dashboard} 
  dataProvider={dataProvider} 
  layout={CustomLayout}
  i18nProvider={i18nProvider}
  >
    <CustomRoutes>
      <Route path="/calendar" element={<CalendarPage />} />
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
  </Admin>
);

export default App;