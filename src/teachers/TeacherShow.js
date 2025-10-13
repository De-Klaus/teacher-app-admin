import React from 'react';
import { Show, SimpleShowLayout, TextField } from 'react-admin';

const TeacherShow = (props) => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="id" label="ID" />
            <TextField source="userId" label="User ID" />
            <TextField source="subject" label="Subject" />
            <TextField source="timeZone" label="Time Zone" />
        </SimpleShowLayout>
    </Show>
);

export default TeacherShow;