import React from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  BooleanField,
} from 'react-admin';

const LessonShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <DateField source="lessonDate" label="Дата урока" />
      <TextField source="topic" label="Тема" />
      <TextField source="links" label="Ссылки" />
      <TextField source="assignment" label="Задание" />
      <TextField source="homework" label="Домашнее задание" />
      <BooleanField source="isActual" label="Актуально" />
      <TextField source="student" label="Ученик" />
      <TextField source="teacher" label="Учитель" />
    </SimpleShowLayout>
  </Show>
);

export default LessonShow;