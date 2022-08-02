// in src/App.js
import * as React from "react";
import {
  Admin,
  Resource,
  ListGuesser,
  EditGuesser,
  ShowGuesser,
} from "react-admin";
import { AdminList } from "./AdminList";
import { OfferList, OfferCreate, OfferShow, OfferEdit } from "./OfferUI";
import { UserCreate, UserEdit, UserList, UserShow } from "./UserUI";
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
    <Resource name="admins" list={AdminList} />

    {/* <Resource
      name="games"
      list={GameList}
      edit={GameEdit}
      show={GameShow}
      create={GameCreate}
    /> */}
    <Resource
      name="users"
      list={UserList}
      edit={UserEdit}
      show={UserShow}
      create={UserCreate}
    />
    <Resource
      name="offers"
      list={OfferList}
      edit={OfferEdit}
      show={OfferShow}
      create={OfferCreate}
    />
  </Admin>
);

export default App;
