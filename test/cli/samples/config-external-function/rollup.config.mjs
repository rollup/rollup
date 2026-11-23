import assert from 'assert';
import { resolve } from 'path';

var config = resolve('./_config.js');

export default {
	input: 'main.js',
	output: {
		format: 'cjs'
	},
	external(id, _importer, _isResolved, { attributes }) {
		return id === config && attributes.type === 'external';
	},
	plugins: [
		{
			load(id) {
				assert.notEqual(id, config);
			}
		}
	]
};
