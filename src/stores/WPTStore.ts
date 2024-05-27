import { createStore } from "vuex";

const COUNT_KEYS = [
  "passingCount",
  "errorCount",
  "failingCount",
  "crashingCount",
  "timeoutCount",
  "notrunCount",
  "preconditionCount",
];

const store = createStore({
  state() {
    return { data: {}, sortingMode: "name", fileList: [], redirectUrl: null };
  },
  mutations: {
    setData(state, { filename, data }) {
      state.data[filename] = Object.freeze(data);
    },
    setSortingMode(state, mode) {
      state.sortingMode = mode;
    },
    setFileList(state, fileList) {
      state.fileList = fileList;
    },
    setRedirectUrl(state, to) {
      state.redirectUrl = to;
    },
  },
  actions: {
    setRedirectUrl(context, to) {
      context.commit("setRedirectUrl", to);
    },
    async fetchFileList(context) {
      const url = "https://wpt.stelar7.no/data/runs/";
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      const allFiles = await response.json();

      const filteredFiles = allFiles
        .filter((file) => file.name.endsWith(".json"))
        .filter((file) => file.name !== "latest.json")
        .filter((file) => file.name !== "report.json")
        .sort((a, b) =>
          b.name.localeCompare(a.name, undefined, { numeric: true })
        );

      context.commit("setFileList", filteredFiles);
    },
    async fetchWPTData(context, filename = "latest.json") {
      if (context.state.data[filename]) return;

      const url = `https://wpt.stelar7.no/data/runs/${filename}`;

      const response = await fetch(url);
      const data = await response.json();

      context.commit("setData", { filename, data });
    },
    updateSortingMode(context, mode) {
      context.commit("setSortingMode", mode);
    },
  },
  getters: {
    getFromPath:
      (state) =>
      (path: Array<string>, fileToUse: string = "latest.json") => {
        const pathString = "/" + path.join("/");

        let current = state.data[fileToUse].results;
        for (const key of path) {
          if (current.children[key]) {
            current = current.children[key];
          } else {
            current = current.results.find(
              (result) => result.parent === pathString
            );
          }
        }

        return current;
      },

    childKeysFromPath: () => (path: Array<string>) => {
      const data = store.getters.getFromPath(path);
      if (!data) return [];

      const children = [];
      for (const key in data.children) {
        if (COUNT_KEYS.includes(key)) continue;

        children.push(key);
      }

      children.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      return children;
    },

    countsForPath:
      () =>
      (
        path: Array<string>,
        includeTotal: boolean = true,
        fileToUse = "latest.json"
      ) => {
        const data = store.getters.getFromPath(path, fileToUse);
        if (!data) return [];

        const children = {};
        for (const key in data.children) {
          if (!COUNT_KEYS.includes(key)) continue;

          const renamedKey = key.replace("Count", "");
          children[renamedKey] = data[key];
        }

        if (includeTotal) {
          children["total"] = Object.values(children).reduce(
            (a, b) => a + b,
            0
          );
        }

        return children;
      },

    resultValuesForPath: () => (path: Array<string>) => {
      const data = store.getters.getFromPath(path);
      if (!data) return [];

      const results = {};
      for (const key in data) {
        if (Array.isArray(data[key])) {
          results[key] = data[key].length;
        }
      }

      results["total"] = Object.values(results).reduce((a, b) => a + b, 0);

      return results;
    },

    resultKeysFromPath: () => (path: Array<string>) => {
      const data = store.getters.getFromPath(path);
      if (!data) return [];

      const results = [];
      for (const key in data.results) {
        results.push(data.results[key]);
      }

      results.sort((a, b) =>
        a.parent.localeCompare(b.parent, undefined, { numeric: true })
      );

      return results;
    },
    typeToIndex: () => (type) => {
      switch (type) {
        case "passing":
          return 0;
        case "failing":
          return 1;
        case "notrun":
          return 2;
        case "error":
          return 3;
        case "crashing":
          return 4;
        case "timeout":
          return 5;
        case "precondition":
          return 6;
        default:
          return 7;
      }
    },
    indexToType: () => (index) => {
      switch (index) {
        case 0:
          return "passing";
        case 1:
          return "failing";
        case 2:
          return "notrun";
        case 3:
          return "error";
        case 4:
          return "crashing";
        case 5:
          return "timeout";
        case 6:
          return "precondition";
        default:
          return "Unknown type";
      }
    },
  },
});

export default store;
