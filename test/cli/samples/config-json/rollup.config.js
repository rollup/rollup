import replace from 'rollup-plugin-replace';
import pkg from './package.json';

module.exports = {
	input: 'main.js',
	output: {
		format: 'cjs'
	},
	plugins: [
		replace( { '__VERSION__': pkg.version } )
	]
};
