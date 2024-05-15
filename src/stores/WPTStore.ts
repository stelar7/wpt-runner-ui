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
      state.data = data;
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

      const response = await fetch("https://wpt.stelar7.no/runs/latest.json");

      const data = await response.json();
      context.commit("setData", data);
    },
  },
  getters: {
    getFromPath: (state) => (path: Array<string>) => {
      if (!state.data) return;

      let current = state.data.results;
      for (const key of path) {
        current = current.children[key];
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
