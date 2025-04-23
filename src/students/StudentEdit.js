import * as React from 'react';
import { Edit, SimpleForm, TextInput, DateInput, NumberInput } from 'react-admin';

const StudentEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="firstName" />
      <TextInput source="lastName" />
      <TextInput source="middleName" />
      <TextInput source="city" />
      <DateInput source="birthDate" />
      <TextInput source="timeZone" />
      <TextInput source="platform" />
      <DateInput source="createdAt" />
      <NumberInput source="schoolStartYear" />
      <NumberInput source="currentGrade" />
      <TextInput source="teacherId.id" label="Teacher ID" />
    </SimpleForm>
  </Edit>
);

export default StudentEdit;
