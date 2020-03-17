import { shebang } from 'rollup-plugin-thatworks';

export default {
	input: 'main.js',
	output: { format: 'cjs' },
	plugins: [shebang()]
};
