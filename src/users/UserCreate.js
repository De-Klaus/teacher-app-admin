import React from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  PasswordInput,
  ReferenceArrayInput,
  SelectArrayInput,
  required,
} from 'react-admin';

// Fallback list in case roles endpoint isn't available
// const fallbackRoleChoices = [
//   { id: 'ROLE_ADMIN', name: 'Admin' },
//   { id: 'ROLE_TEACHER', name: 'Teacher' },
//   { id: 'ROLE_STUDENT', name: 'Student' },
// ];

const RolesInput = () => (
  <ReferenceArrayInput source="roles" reference="roles" perPage={50} sort={{ field: 'id', order: 'ASC' }}>
    <SelectArrayInput optionText={(r) => r.name || r.id} />
  </ReferenceArrayInput>
);

const UserCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="firstName" label="First name" validate={[required()]} />
      <TextInput source="lastName" label="Last name" validate={[required()]} />
      <TextInput source="email" label="Email" type="email" validate={[required()]} />
      <PasswordInput source="password" label="Password" validate={[required()]} />
      {/* Prefer backend roles; react-admin will call /roles. If 404, fall back below. */}
      <RolesInput />
      {/* Fallback: uncomment if backend doesn't expose /roles
      <SelectArrayInput source="roles" choices={fallbackRoleChoices} />
      */}
    </SimpleForm>
  </Create>
);

export default UserCreate;


