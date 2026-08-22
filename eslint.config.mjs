import js from '@eslint/js';

export default [
  {
    ignores: ['.next', '**/.next/**', 'node_modules', 'dist'],
  },
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
];
