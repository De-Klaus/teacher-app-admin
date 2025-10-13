import * as React from 'react';
import { Show, SimpleShowLayout, TextField, DateField, NumberField } from 'react-admin';

const StudentShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField label="ID" source="id" />
      <TextField label="User ID" source="userId" />
      <DateField label="Birth Date" source="birthDate" />
      <TextField label="Phone" source="phoneNumber" />
      <TextField label="City" source="city" />
      <TextField label="Time Zone" source="timeZone" />
      <NumberField label="Grade" source="grade" />
      <TextField label="School" source="school" />
    </SimpleShowLayout>
  </Show>
);

export default StudentShow;
