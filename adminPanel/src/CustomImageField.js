import { useRecordContext } from "react-admin";

export const CustomImageField = (props) => {
  const record = useRecordContext(props);
  // console.log(record);
  return record ? (
    <div>

      <img
        src={`http://localhost:5000/${record[props.source]}`}
        title="image"
        width="64"
        height="64"
        style={{
          borderRadius: '64px'
        }}
      />
    </div>
  ) : null;
};
