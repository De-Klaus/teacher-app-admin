import React from "react";
import { Admin, Resource } from 'react-admin';
import dataProvider from './dataProvider';

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
  <Admin dataProvider={dataProvider}>
    <Resource
      name="students"
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