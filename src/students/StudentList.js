import * as React from 'react';
import { 
    List, 
    Datagrid, 
    TextField, 
    DateField, 
    NumberField,
    ShowButton, 
    EditButton, 
    DeleteButton } from 'react-admin';

const StudentList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" label="ID" />
      <TextField source="userId" label="User ID" />
      <DateField source="birthDate" label="Birth Date" />
      <TextField source="phoneNumber" label="Phone" />
      <TextField source="city" label="City" />
      <TextField source="timeZone" label="Time Zone" />
      <NumberField source="grade" label="Grade" />
      <TextField source="school" label="School" />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default StudentList;
