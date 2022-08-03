import {
  List,
  Edit,
  Create,
  Datagrid,
  NumberField,
  TextField,
  EmailField,
  DateField,
  SimpleForm,
  TextInput,
  NumberInput,
  DateInput,
  Show,
  SimpleShowLayout,
  RichTextField,
  EditButton,
  ImageField,
  ImageInput,
  minLength,
  required,
  maxLength,
  email,
  SearchInput,
} from "react-admin";
import { Chip } from "@mui/material";
import { useRecordContext } from "react-admin";
export const QuickFilter = ({ label }) => {
  return <Chip sx={{ marginBottom: 1 }} label={label} />;
};
const validateLink = [required(), minLength(2), maxLength(15)];
const validateTitle = [required(), minLength(2), maxLength(15)];
const OfferFilters = [
  <SearchInput source="q" alwaysOn />,
  <QuickFilter source="amount" label="High paying" defaultValue={150} />,
];
export const OfferList = () => (
  <List filters={OfferFilters}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <OfferImageField source="icon" />
      <NumberField source="active" />
      <TextField source="title" />
      <TextField source="amount" />
      <TextField source="description" />
    </Datagrid>
  </List>
);

export const OfferEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" />
      <NumberInput source="active" />
      <TextInput source="title" validate={validateTitle} />
      <TextInput source="link" validate={validateLink} />
      <ImageInput source="pictures" multiple={true} accept="image/png">
        <ImageField source="src" title="profile image" />
      </ImageInput>
    </SimpleForm>
  </Edit>
);
export const OfferCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="id" />
      <NumberInput source="active" />
      <TextInput source="title" validate={validateTitle} />
      <TextInput source="link" validate={validateLink} />

      <ImageInput source="pictures" multiple={true} accept="image/png">
        <ImageField source="src" title="profile image" />
      </ImageInput>
    </SimpleForm>
  </Create>
);
export const OfferShow = () => (
  <Show>
    <SimpleShowLayout>
      <OfferImageField source="icon" />
      <TextField source="title" />

      <TextField source="link" />
    </SimpleShowLayout>
  </Show>
);

export const OfferImageField = (props) => {
  const record = useRecordContext(props);
  // console.log(record);
  return record ? (
    <div>
      <img
        src={record[props.source]}
        title="image"
        width="64"
        height="64"
        style={{
          borderRadius: "64px",
        }}
      />
    </div>
  ) : null;
};
