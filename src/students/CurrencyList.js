import React from "react";
import { List, Datagrid, TextField } from "react-admin";

const CurrencyList = (props) => (
  <List {...props} pagination={false}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="currencyName" />
    </Datagrid>
  </List>
);

export default CurrencyList;