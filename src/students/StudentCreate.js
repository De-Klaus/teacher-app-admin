import * as React from 'react';
import { Create, SimpleForm, TextInput, DateInput, NumberInput } from 'react-admin';

const StudentCreate = () => (
  <Create>
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
  </Create>
);

export default StudentCreate;
