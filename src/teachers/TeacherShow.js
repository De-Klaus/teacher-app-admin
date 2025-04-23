import React from 'react';
import { Show, SimpleShowLayout, TextField, ReferenceField } from 'react-admin';

const TeacherShow = (props) => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="name" />
            <ReferenceField source="user.id" reference="users">
                <TextField source="username" />
            </ReferenceField>
        </SimpleShowLayout>
    </Show>
);

export default TeacherShow;