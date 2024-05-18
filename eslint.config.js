import globals from "globals";
import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";

export default [
  { languageOptions: { globals: globals.browser } },
  {
    rules: {
      "@stylistic/js/max-len": ["error", 180],
      "@stylistic/js/indent": ["error", 4],
    },
  },
];
