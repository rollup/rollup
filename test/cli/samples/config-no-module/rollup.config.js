import { shebang } from 'rollup-plugin-thatworks';

export default {
	input: './sub/main.js',
	output: { format: 'cjs' },
	plugins: [shebang()]
};
