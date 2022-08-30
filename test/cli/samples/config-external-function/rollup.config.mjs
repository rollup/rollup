import assert from 'assert';
import { resolve } from 'path';

var config = resolve('./_config.js');

export default {
	input: 'main.js',
	output: {
		format: 'cjs'
	},
	external(id) {
		return id === config;
	},
	plugins: [
		{
			load(id) {
				assert.notEqual(id, config);
			}
		}
	]
};
