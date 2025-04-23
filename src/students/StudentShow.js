import * as React from 'react';
import { Show, SimpleShowLayout, TextField, DateField, NumberField } from 'react-admin';

const StudentShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField label="First Name" source="firstName" />
      <TextField label="Last Name" source="lastName" />
      <TextField label="Middle Name" source="middleName" />
      <TextField label="City" source="city" />
      <DateField label="Birth Date" source="birthDate" />
      <TextField label="Time Zone" source="timeZone" />
      <TextField label="Platform" source="platform" />
      <NumberField label="School Start Year"  source="schoolStartYear" />
      <NumberField label="Current Grade" source="currentGrade" />
      <TextField source="teacherId.id" label="Teacher ID" />
    </SimpleShowLayout>
  </Show>
);

export default StudentShow;
