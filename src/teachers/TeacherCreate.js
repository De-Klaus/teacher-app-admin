import React from 'react';
import { Create, SimpleForm, TextInput, required } from 'react-admin';

const TeacherCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="userId" label="User ID" validate={[required()]} />
            <TextInput source="subject" label="Subject" />
            <TextInput source="timeZone" label="Time Zone" />
        </SimpleForm>
    </Create>
);

export default TeacherCreate;