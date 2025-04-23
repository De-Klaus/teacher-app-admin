import { Edit, SimpleForm, TextInput, NumberInput, DateInput, ReferenceInput, SelectInput } from 'react-admin';

const TariffEdit = () => (
  <Edit>
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
  </Edit>
);

export default TariffEdit;
