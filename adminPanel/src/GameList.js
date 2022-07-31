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
  useListContext,
  useRedirect,
  useRecordContext,
  useShowContext,
  useShowController,
  CreateButton,
  FunctionField,
  useDataProvider,
} from "react-admin";
import { httpClient, apiUrl } from "./dataProvider";
import { CustomImageField } from "./CustomImageField";
import {
  Box,
  Paper,
  DialogTitle,
  Dialog,
  Button,
  TextField as MUITextField,
  Autocomplete,
} from "@mui/material";
import throttle from "lodash/throttle";
import { useEffect, useState } from "react";
// const styles = {
//   gameContainer: {
//     backgroundImage: `url(http://localhost:5000/logo192.png)`,
//   },
// };
export const Games = () => {
  const { data } = useListContext();
  //console.log(data);
  const redirect = useRedirect();

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        "& > :not(style)": {
          m: 1,
          width: 128,
          height: 128,
        },
      }}
    >
      {data.map((game) => (
        <Paper
          sx={{
            padding: 1,
            "&:hover": {
              boxShadow: 8,
            },
            backgroundImage: `url(http://localhost:5000/${game.gameImage})`,
          }}
          onClick={() =>
            redirect(`http://localhost:3000/#/games/${game.id}/show`)
          }
        >
          {game.id}
          {game.name}
        </Paper>
      ))}
    </Box>
  );
};

export const GameList = () => (
  <List emptyWhileLoading>
    <Games />
  </List>
);

export const GameEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" />

      <TextInput source="name" />

      <ImageInput source="pictures" multiple={true} accept="image/png">
        <ImageField source="src" title="profile image" />
      </ImageInput>
    </SimpleForm>
  </Edit>
);
export const GameCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="id" />

      <TextInput source="name" />

      <ImageInput source="pictures" multiple={true} accept="image/png">
        <ImageField source="src" title="Game Image" />
      </ImageInput>
    </SimpleForm>
  </Create>
);
export const GameShow = () => {
  let { record } = useShowController();
  const dataProvider = useDataProvider();
  const [data, setData] = useState(undefined);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
    dataProvider.getGamePlayers(record.id);
    //fetchGamePlayers();
  };
  const addPlayer = () => {
    console.log("Player value", value);
    dataProvider.addPlayer(value.id, record.id);
    dataProvider.getGamePlayers(record.id);
    //fetchGamePlayers();

    // try {
    //   (async function () {
    //     let json = await httpClient(`${apiUrl}/games/addPlayer`, {
    //       method: "POST",
    //       body: JSON.stringify({ playerId: value.id, gameId: record.id }),
    //     });
    //   })();
    //   console.log("addPlayer");
    //   fetchGamePlayers();
    //   console.log("addPlayer fetched");
    // } catch (error) {
    //   console.log(error);
    // }
  };

  const deletePlayer = (id) => {
    dataProvider.deletePlayer(id, record.id);
    // try {
    //   (async function () {
    //     let json = await httpClient(`${apiUrl}/games/deletePlayer`, {
    //       method: "POST",
    //       body: JSON.stringify({ playerId: id, gameId: record.id }),
    //     });
    //   })();
    //   console.log("deletePlayer");
    //   fetchGamePlayers();
    //   console.log("deletePlayer fetched");
    // } catch (error) {
    //   console.log(error);
    // }
  };

  const SearchBar = () => {
    const [options, setOptions] = useState([]);
    const [inputValue, setInputValue] = useState("");
    dataProvider.searchPlayers(inputValue);
    // const fetch = async () => {
    //   try {
    //     let json = await httpClient(
    //       `${apiUrl}/players/searchPlayers?searchQuery=${inputValue}`
    //     );
    //     console.log(json);
    //     setOptions(json.json);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };

    useEffect(() => {
      console.log(value, inputValue);
      throttle(dataProvider.searchPlayers, 500)();
    }, [value, inputValue]);

    return (
      <Autocomplete
        id="standard-basic"
        options={options}
        filterOptions={(x) => x}
        value={value}
        onChange={(event, newValue) => {
          setOptions(newValue ? [newValue, ...options] : options);
          setValue(newValue);
        }}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        renderInput={(params) => (
          <MUITextField {...params} label="Add player" fullWidth />
        )}
      />
    );
  };
  // const fetchGamePlayers = async () => {
  //   console.log("fetchGamePlayers");
  //   if (!record) {
  //     return;
  //   }
  //   try {
  //     let json = await httpClient(
  //       `${apiUrl}/games/getGamePlayers/?gameId=${record.id}`
  //     );
  //     console.log("fetchGamePlayers", json);
  //     setData(json.json);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  useEffect(() => {
    console.log("useEffect");
    dataProvider.getGamePlayers(record.id);
    // fetchGamePlayers();
  }, []);

  const sort = { field: "id", order: "DESC" };
  return (
    <Show>
      <Dialog open={open}>
        <DialogTitle>Add Player to Game:</DialogTitle>
        <Box
          sx={{
            padding: 4,
          }}
        >
          <SearchBar />
          <Button onClick={handleClose}>Close</Button>
          <Button onClick={addPlayer}>Add</Button>
        </Box>
      </Dialog>
      <SimpleShowLayout>
        <CustomImageField source="gameImage" />
        <TextField source="name" />
        {data !== undefined ? (
          <div>
            <Button variant="outlined" onClick={handleClickOpen}>
              Add player
            </Button>
            <Datagrid data={data} total={1} isLoading={false} sort={sort}>
              <TextField source="id" />
              <TextField source="name" />
              <FunctionField
                render={(record) => {
                  return (
                    <Button
                      variant="outlined"
                      onClick={() => deletePlayer(record.id)}
                    >
                      Delete
                    </Button>
                  );
                }}
              />
            </Datagrid>
          </div>
        ) : null}
      </SimpleShowLayout>
    </Show>
  );
};
