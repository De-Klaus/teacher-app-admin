import * as React from 'react';
import { Create, SimpleForm, TextInput, DateInput, NumberInput, required } from 'react-admin';

const StudentCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="userId" label="User ID" validate={[required()]} />
      <DateInput source="birthDate" label="Birth Date" />
      <TextInput source="phoneNumber" label="Phone" />
      <TextInput source="city" label="City" />
      <TextInput source="timeZone" label="Time Zone" />
      <NumberInput source="grade" label="Grade" />
      <TextInput source="school" label="School" />
    </SimpleForm>
  </Create>
);

export default StudentCreate;
