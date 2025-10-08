import React from 'react';
import { FunctionField } from 'react-admin';
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
      <FunctionField
        label="Ученик"
        render={record =>
          record.student
            ? `${record.student.lastName || ''} ${record.student.firstName || ''} ${record.student.middleName || ''}`.trim()
            : ''
        }
      />
      <TextField source="student.firstName " label="Ученик" />
      <TextField source="teacher" label="Учитель" />
    </SimpleShowLayout>
  </Show>
);

export default LessonShow;