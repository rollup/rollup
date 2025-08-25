import type { RollupOptions } from '../../../../../../../dist/rollup';

export const MY_CUSTOM_OPTIONS: RollupOptions = {
  input: 'src/bundlable-code.js',
  output: {
    format: 'esm'
  }
};
