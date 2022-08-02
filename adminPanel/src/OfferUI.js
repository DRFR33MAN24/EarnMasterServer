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
} from "react-admin";
import { useRecordContext } from "react-admin";
const validateLink = [required(), minLength(2), maxLength(15)];
const validateTitle = [required(), minLength(2), maxLength(15)];

export const OfferList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <OfferImageField source="icon" />
      <NumberField source="active" />
      <TextField source="title" />
      <TextField source="link" />
    </Datagrid>
  </List>
);

export const UserEdit = () => (
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
