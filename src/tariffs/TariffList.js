import { List, Datagrid, TextField, NumberField, DateField, ReferenceField, EditButton, ShowButton  } from 'react-admin';

const TariffList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="tariffName" />
      <NumberField source="price" />
      <NumberField source="durationMinutes" />
      <ReferenceField source="currency.id" reference="currencies">
        <TextField source="currencyName" />
      </ReferenceField>
      <TextField source="comment" />
      <DateField source="createdAt" />
      <NumberField source="isActual" />
      <ReferenceField source="teacherId.id" reference="teachers">
        <TextField source="name" />
      </ReferenceField>
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export default TariffList;
