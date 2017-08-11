import replace from 'rollup-plugin-replace';
import pkg from './package.json';

module.exports = {
	entry: 'main.js',
	format: 'cjs',
	plugins: [
		replace({ '__VERSION__': pkg.version })
	]
};
