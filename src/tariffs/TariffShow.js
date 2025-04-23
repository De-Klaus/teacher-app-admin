import { Show, SimpleShowLayout, TextField, NumberField, DateField, ReferenceField } from 'react-admin';

const TariffShow = () => (
  <Show>
    <SimpleShowLayout>
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
    </SimpleShowLayout>
  </Show>
);

export default TariffShow;
