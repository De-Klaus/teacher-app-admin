import React from 'react';
import { List, Datagrid, TextField, ReferenceField, EditButton, ShowButton } from 'react-admin';

const TeacherList = (props) => (
    <List {...props}>
        <Datagrid rowClick="show">
            <TextField source="name" />
            <ReferenceField source="user.id" reference="users">
                <TextField source="username" />
            </ReferenceField>
            <EditButton />
            <ShowButton />
        </Datagrid>
    </List>
);

export default TeacherList;
