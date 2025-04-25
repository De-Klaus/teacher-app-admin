import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  ShowButton,
  EditButton,
} from 'react-admin';

const LessonList = (props) => (
  <List {...props}>
    <Datagrid rowClick="show">
      <TextField source="id" label="ID" />
      <DateField source="lessonDate" label="Дата" />
      <TextField source="topic" label="Тема" />
      <BooleanField source="isActual" label="Актуально" />
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export default LessonList;