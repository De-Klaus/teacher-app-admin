import React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  DateInput,
  BooleanInput,
} from 'react-admin';

const LessonEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="id" disabled />
      <DateInput source="lessonDate" label="Дата урока" />
      <TextInput source="topic" label="Тема" />
      <TextInput source="links" label="Ссылки" />
      <TextInput source="assignment" label="Задание" />
      <TextInput source="homework" label="Домашнее задание" />
      <BooleanInput source="isActual" label="Актуально" />
      <TextInput source="student" label="Ученик" />
      <TextInput source="teacher" label="Учитель" />
    </SimpleForm>
  </Edit>
);

export default LessonEdit;