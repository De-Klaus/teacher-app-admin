import React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  DateTimeInput,
  NumberInput,
  SelectInput,
  ReferenceInput,
  AutocompleteInput,
  required,
} from 'react-admin';

const LessonEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="id" label="ID" disabled />
      <ReferenceInput source="studentId" reference="students" label="Ученик" validate={[required()]}>
        <AutocompleteInput optionText={(r) => `${r.lastName || ''} ${r.firstName || ''}`.trim()} />
      </ReferenceInput>
      <ReferenceInput source="teacherId" reference="teachers" label="Учитель" validate={[required()]}>
        <AutocompleteInput optionText={(r) => `${r.lastName || ''} ${r.firstName || ''}`.trim()} />
      </ReferenceInput>
      <DateTimeInput source="scheduledAt" label="Дата/время" validate={[required()]} />
      <NumberInput source="durationMinutes" label="Длительность, мин" validate={[required()]} />
      <NumberInput source="price" label="Цена" validate={[required()]} />
      <SelectInput
        source="status"
        label="Статус"
        choices={[
          { id: 'SCHEDULED', name: 'Запланирован' },
          { id: 'COMPLETED', name: 'Проведён' },
          { id: 'CANCELLED', name: 'Отменён' },
        ]}
        validate={[required()]}
      />
      <TextInput source="homework" label="Домашнее задание" multiline />
      <TextInput source="feedback" label="Отзыв" multiline />
    </SimpleForm>
  </Edit>
);

export default LessonEdit;