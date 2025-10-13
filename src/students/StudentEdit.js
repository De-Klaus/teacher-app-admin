import * as React from 'react';
import { Edit, SimpleForm, TextInput, DateInput, NumberInput } from 'react-admin';

const StudentEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" label="ID" disabled />
      <TextInput source="userId" label="User ID" />
      <DateInput source="birthDate" label="Birth Date" />
      <TextInput source="phoneNumber" label="Phone" />
      <TextInput source="city" label="City" />
      <TextInput source="timeZone" label="Time Zone" />
      <NumberInput source="grade" label="Grade" />
      <TextInput source="school" label="School" />
    </SimpleForm>
  </Edit>
);

export default StudentEdit;
