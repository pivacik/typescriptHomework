/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
  // A set of global variables that need to be available in all test environments
  globals: {
    'ts-jest': {
      diagnostics: {
        exclude: ['**'], //Disable ts checks since problem file has no types yet
      },
    },
  },
  rootDir: 'src',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};

export default config;
