import { nivalis } from '@nivalis/eslint-config';

export default nivalis(
  {
    tailwindcss: false,
    react: false,
  },
  {
    rules: {
      'node/no-unpublished-import': 'off',
    },
  },
);
