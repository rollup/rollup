import { RollupOptions } from '../../../../dist/rollup';

const options: RollupOptions = {
	input: 'main.js',
	output: {
		format: 'cjs'
	}
};

export { options as default };
