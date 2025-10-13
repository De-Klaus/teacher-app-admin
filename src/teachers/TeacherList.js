import React from 'react';
import { List, Datagrid, TextField, EditButton, ShowButton } from 'react-admin';

const TeacherList = (props) => (
    <List {...props}>
        <Datagrid rowClick="show">
            <TextField source="id" label="ID" />
            <TextField source="userId" label="User ID" />
            <TextField source="subject" label="Subject" />
            <TextField source="timeZone" label="Time Zone" />
            <EditButton />
            <ShowButton />
        </Datagrid>
    </List>
);

export default TeacherList;
