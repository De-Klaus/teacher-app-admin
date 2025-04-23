import React from 'react';
import { Edit, SimpleForm, TextInput, ReferenceInput, SelectInput } from 'react-admin';

const TeacherEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput source="name" />
            <ReferenceInput source="user.id" reference="users">
                <SelectInput optionText="username" />
            </ReferenceInput>
        </SimpleForm>
    </Edit>
);

export default TeacherEdit;