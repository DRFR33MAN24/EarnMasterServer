// in src/App.js
import * as React from "react";
import {
  Admin,
  Resource,
  ListGuesser,
  EditGuesser,
  ShowGuesser,
} from "react-admin";
import { UserList } from "./UserList";
import { PlayerList, PlayerEdit, PlayerShow, PlayerCreate } from "./PlayerList";
import { GameList, GameEdit, GameShow, GameCreate } from "./GameList";
import authProvider from "./authProvider";
import addUploadFeature from "./addUploadFeature";

import LoginPage from "./LoginPage";
import { Dashboard } from "./Dashboard";
//import jsonServerProvider from "ra-data-json-server";

//const dataProvider = jsonServerProvider("https://jsonplaceholder.typicode.com");

const App = () => (
  <Admin
    dashboard={Dashboard}
    loginPage={LoginPage}
    dataProvider={addUploadFeature}
    authProvider={authProvider}
  >
    <Resource name="users" list={UserList} />
    <Resource
      name="games"
      list={GameList}
      edit={GameEdit}
      show={GameShow}
      create={GameCreate}
    />
    <Resource
      name="players"
      list={PlayerList}
      edit={PlayerEdit}
      show={PlayerShow}
      create={PlayerCreate}
    />
  </Admin>
);

export default App;
