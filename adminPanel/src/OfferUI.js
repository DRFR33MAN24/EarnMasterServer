import {
  List,
  Datagrid,
  NumberField,
  TextField,
  DateField,
  ImageField,
} from "react-admin";
import { useRecordContext } from "react-admin";

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
