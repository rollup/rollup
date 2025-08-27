import type { RollupOptions } from '../../../../../../dist/rollup';

export const MY_CUSTOM_OPTIONS: RollupOptions = {
	input: 'input.js',
	output: {
		format: 'esm',
	}
};
