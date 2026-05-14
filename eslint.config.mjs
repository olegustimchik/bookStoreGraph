import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import-x';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier';
import jest from 'eslint-plugin-jest';

export default [
  // 🔹 Base JS rules
  js.configs.recommended,

  // 🔹 TypeScript rules
  ...tseslint.configs.recommendedTypeChecked,

  // 🔹 Prettier (must be LAST)
  prettier,

  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },

    plugins: {
      'import-x': importPlugin,
      'unused-imports': unusedImports,
    },

    rules: {
      /* -------------------- Code quality -------------------- */
      'no-console': 'warn',
      'no-debugger': 'error',

      /* -------------------- TypeScript -------------------- */
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'off', // handled below
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-call': 'off',

      /* -------------------- Imports -------------------- */
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index', 'type'],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      /* -------------------- Cleanup -------------------- */
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  // 🔹 Test overrides
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
    plugins: { jest },
    rules: {
      ...jest.configs.recommended.rules,
      ...jest.configs.style.rules,
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
