import React from 'react';
import { FunctionField } from 'react-admin';
import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  NumberField,
  ReferenceField,
} from 'react-admin';

const LessonShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <DateField source="scheduledAt" label="Дата/время" showTime />
      <NumberField source="durationMinutes" label="Длительность, мин" />
      <NumberField source="price" label="Цена" />
      <TextField source="status" label="Статус" />
      <TextField source="homework" label="Домашнее задание" />
      <TextField source="feedback" label="Отзыв" />
      <ReferenceField source="studentId" reference="students" label="Ученик" link={false}>
        <FunctionField render={r => `${r.lastName || ''} ${r.firstName || ''}`.trim()} />
      </ReferenceField>
      <ReferenceField source="teacherId" reference="teachers" label="Учитель" link={false}>
        <FunctionField render={r => `${r.lastName || ''} ${r.firstName || ''}`.trim()} />
      </ReferenceField>
    </SimpleShowLayout>
  </Show>
);

export default LessonShow;