import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  ShowButton,
  EditButton,
  ReferenceField,
  useNotify,
} from 'react-admin';

const LessonList = (props) => {
  const notify = useNotify();

  // Custom error handling for the List component
  const handleError = (error) => {
    console.error('LessonList Error:', error);
    
    if (error.message) {
      notify(error.message, { type: 'error' });
    } else {
      notify('An error occurred while loading lessons. Please try again.', { type: 'error' });
    }
  };

  return (
    <List {...props} onError={handleError}>
      <Datagrid rowClick="show">
        <TextField source="id" label="ID" />
        <DateField source="scheduledAt" label="Дата/время" showTime />
        <NumberField source="durationMinutes" label="Длительность, мин" />
        <NumberField source="price" label="Цена" />
        <TextField source="status" label="Статус" />
        <ReferenceField source="studentId" reference="students" label="Ученик" link={false}>
          <TextField source="lastName" />
        </ReferenceField>
        <ReferenceField source="teacherId" reference="teachers" label="Учитель" link={false}>
          <TextField source="lastName" />
        </ReferenceField>
        <EditButton />
        <ShowButton />
      </Datagrid>
    </List>
  );
};

export default LessonList;