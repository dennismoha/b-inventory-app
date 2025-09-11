import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  {
    // Note: there should be no other properties in this object
    ignores: ["eslint.config.mjs"]
},
  { languageOptions: { globals: {...globals.node} } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      "semi":[2, "always"],
      "space-before-function-paren":[0,{"anonymous":"always", "named":"always"}],
      "camelcase":0,
      "no-return-assign": 0,
      "quotes":["error", "single"],
      "@typescript-eslint/no-non-null-assertion":"off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/explicit-module-boundary-types":"off"
    }
  }
];
