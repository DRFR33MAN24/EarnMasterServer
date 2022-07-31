// import { fetchUtils } from "react-admin";
// import simpleRestProvider from "ra-data-simple-rest";

// const fetchJson = (url, options = {}) => {
//   options.user = {
//     authenticated: true,
//     // use the token from local storage
//     token: localStorage.getItem("token"),
//   };
//   return fetchUtils.fetchJson(url, options);
// };
// const dataProvider = simpleRestProvider("http://localhost:3000/", fetchJson);

import { fetchUtils } from "react-admin";
import { stringify } from "query-string";

export const apiUrl = "http://localhost:5000/api";
export const httpClient = (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: "application/json" });
  }
  const token = localStorage.getItem("token");
  options.headers.set("x-auth-token", token);
  //console.log(url, options);
  return fetchUtils.fetchJson(url, options);
};

export default {
  getList: (resource, params) => {
    console.log("getList called", resource);
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify(params.filter),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;

    return httpClient(url).then(({ headers, json }) => ({
      data: json,
      total: parseInt(headers.get("X-Total-Count"), 10),
    }));
  },

  getOne: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
      data: json,
    })),

  getMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ ids: params.ids }),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    return httpClient(url).then(({ json }) => ({ data: json }));
  },

  getManyReference: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify({
        ...params.filter,
        [params.target]: params.id,
      }),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;

    return httpClient(url).then(({ headers, json }) => ({
      data: json,
      total: parseInt(headers.get("content-range").split("/").pop(), 10),
    }));
  },

  create: (resource, params) =>
    httpClient(`${apiUrl}/${resource}`, {
      method: "POST",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: { ...params.data, id: json.id },
    })),

  update: (resource, params) => {
    console.log(params);
    return httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: "PUT",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json }));
  },

  updateMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
      method: "PUT",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json }));
  },

  delete: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: "DELETE",
    }).then(({ json }) => ({ data: json })),

  deleteMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
      method: "DELETE",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json }));
  },
  // custom methods
  addPlayer: (playerId, gameId) => {
    (async function () {
      try {
        let json = await httpClient(`${apiUrl}/games/addPlayer`, {
          method: "POST",
          body: JSON.stringify({ playerId: playerId, gameId: gameId }),
        });
        return json;
      } catch (error) {
        console.log(error);
      }
    })();
  },
  deletePlayer: (playerId, gameId) => {
    (async function () {
      try {
        let json = await httpClient(`${apiUrl}/games/deletePlayer`, {
          method: "POST",
          body: JSON.stringify({ playerId: playerId, gameId: gameId }),
        });
        return json;
      } catch (error) {
        console.log(error);
      }
    })();
  },
  searchPlayers: (searchQuery) => {
    (async function () {
      try {
        let json = await httpClient(
          `${apiUrl}/players/searchPlayers?searchQuery=${searchQuery}`
        );
        return json;
      } catch (error) {
        console.log(error);
      }
    })();
  },
  getGamePlayers: (gameId) => {
    (async function () {
      try {
        let json = await httpClient(
          `${apiUrl}/games/getGamePlayers/?gameId=${gameId}`
        );

        return json;
      } catch (error) {
        console.log(error);
      }
    })();
  },
};
