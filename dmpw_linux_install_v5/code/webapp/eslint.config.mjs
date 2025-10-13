import js from '@eslint/js';
import { flatConfig as pluginNextFlatConfig } from '@next/eslint-plugin-next';
import { defineConfig } from 'eslint/config';
import pluginNoRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  pluginNextFlatConfig.recommended,

  {
    plugins: {
      'no-relative-import-paths': pluginNoRelativeImportPaths,
      'simple-import-sort': pluginSimpleImportSort,
    },
  },

  {
    rules: {
      'no-relative-import-paths/no-relative-import-paths': ['warn', { allowSameFolder: true, prefix: '@' }],

      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            // `react` first, `next` second, then packages starting with a character
            ['^react$', '^next', '^[@a-z]'],
            // Packages starting with `be`
            ['^@/'],
            // Packages starting with `~`
            ['^~'],
            // Imports starting with `../`
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Imports starting with `./`
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // Style imports
            ['^.+\\.s?css$'],
            // Side effect imports
            ['^\\u0000'],
          ],
        },
      ],
      'simple-import-sort/exports': 'warn',

      'prettier/prettier': 'warn',

      'no-console': 'off',
      'no-restricted-syntax': [
        'warn',
        {
          selector: "CallExpression[callee.object.name='console'][callee.property.name='log']",
          message: 'Unexpected console.log, use console.error or console.info instead.',
        },
      ],

      '@typescript-eslint/no-explicit-any': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
]);
