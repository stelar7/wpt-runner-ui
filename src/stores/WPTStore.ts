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
    return { currentPath: [], data: null };
  },
  mutations: {
    setData(state, data) {
      state.data = Object.freeze(data);
    },
    addPath(state, path) {
      state.currentPath.push(path);
    },
    popPath(state) {
      state.currentPath.pop();
    },
  },
  actions: {
    async fetchWPTData(context) {
      if (context.state.data) return;

      const response = await fetch("https://wpt.stelar7.no/data/runs/latest.json");

      const data = await response.json();
      context.commit("setData", data);
    },
  },
  getters: {
    getFromPath: (state) => (path: Array<string>) => {
      const pathString = "/" + path.join("/");

      let current = state.data.results;
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

      children.sort((a, b) => a.localeCompare(b));

      return children;
    },

    countsForPath: () => (path: Array<string>) => {
      const data = store.getters.getFromPath(path);
      if (!data) return [];

      const children = {};
      for (const key in data.children) {
        if (!COUNT_KEYS.includes(key)) continue;

        const renamedKey = key.replace("Count", "");
        children[renamedKey] = data[key];
      }

      children["total"] = Object.values(children).reduce((a, b) => a + b, 0);

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

      results.sort((a, b) => a.parent.localeCompare(b.parent));

      return results;
    },
  },
});

export default store;
