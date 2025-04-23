import * as React from 'react';
import { 
    List, 
    Datagrid, 
    TextField, 
    DateField, 
    ReferenceField, 
    ShowButton, 
    EditButton, 
    DeleteButton } from 'react-admin';

const StudentList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="firstName" />
      <TextField source="lastName" />
      <TextField source="city" />
      <DateField source="birthDate" />
      <TextField source="platform" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default StudentList;
