import * as React from 'react';
import { Show, SimpleShowLayout, TextField, DateField, NumberField, ReferenceField  } from 'react-admin';

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
      <ReferenceField source="teacher.id" reference="teachers">
              <TextField source="name" />
      </ReferenceField>
    </SimpleShowLayout>
  </Show>
);

export default StudentShow;
