import React from 'react';
import { Create, SimpleForm, TextInput, ReferenceInput, SelectInput } from 'react-admin';

const TeacherCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="name" />
            <ReferenceInput source="user.id" reference="users">
                <SelectInput optionText="username" />
            </ReferenceInput>
        </SimpleForm>
    </Create>
);

export default TeacherCreate;