import { Create, SimpleForm, TextInput, NumberInput, DateInput, ReferenceInput, SelectInput } from 'react-admin';

const TariffCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="tariffName" />
      <NumberInput source="price" />
      <NumberInput source="durationMinutes" />
      <ReferenceInput source="currency.id" reference="currencies">
        <SelectInput optionText="currencyName" />
      </ReferenceInput>
      <TextInput source="comment" />
      <DateInput source="createdAt" />
      <NumberInput source="isActual" />
      <ReferenceInput source="teacherId.id" reference="teachers">
        <SelectInput optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export default TariffCreate;
