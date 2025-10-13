import React from 'react';
import { Edit, SimpleForm, TextInput } from 'react-admin';

const TeacherEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput source="id" label="ID" disabled />
            <TextInput source="userId" label="User ID" />
            <TextInput source="subject" label="Subject" />
            <TextInput source="timeZone" label="Time Zone" />
        </SimpleForm>
    </Edit>
);

export default TeacherEdit;