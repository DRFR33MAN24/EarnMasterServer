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
import { CustomImageField } from "./CustomImageField";

const validateUser = (values) => {
  const errors = {};
  if (values.new_password !== values.repeat_password) {
    errors.password = "Passwords dosen't match";
  }

  return errors;
};

const validateName = [required(), minLength(2), maxLength(15)];
const validateEmail = email();

const validatePassword = [required(), minLength(8)];

export const UserList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <CustomImageField source="profileImg" />
      <NumberField source="active" />
      <TextField source="name" />
      <EmailField source="email" />

      <EditButton />
    </Datagrid>
  </List>
);

export const UserEdit = () => (
  <Edit>
    <SimpleForm validate={validateUser}>
      <TextInput source="id" />
      <NumberInput source="active" />
      <TextInput source="name" validate={validateName} />
      <TextInput source="email" validate={validateEmail} />
      <ImageInput source="pictures" multiple={true} accept="image/png">
        <ImageField source="src" title="profile image" />
      </ImageInput>

      <TextInput source="password" validate={validatePassword} />
      <TextInput source="repeat_password" validate={validatePassword} />
    </SimpleForm>
  </Edit>
);
export const UserCreate = () => (
  <Create>
    <SimpleForm validate={validateUser}>
      <TextInput source="id" />
      <NumberInput source="active" />
      <TextInput source="name" validate={validateName} />
      <TextInput source="email" validate={validateEmail} />
      <ImageInput source="pictures" multiple={true} accept="image/png">
        <ImageField source="src" title="profile image" />
      </ImageInput>

      <TextInput source="password" validate={validatePassword} />
      <TextInput source="repeat_password" validate={validatePassword} />
    </SimpleForm>
  </Create>
);
export const UserShow = () => (
  <Show>
    <SimpleShowLayout>
      <CustomImageField source="profileImg" />
      <TextField source="name" />

      <TextField source="email" />
    </SimpleShowLayout>
  </Show>
);
