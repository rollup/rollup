const assert = require('assert');
const path = require('path');

const expectedNames = new Set([
	'nested/a',
	'b.str',
	'c',
	'd',
	'e',
	'f',
	'g',
	'h',
	'main',
	'no-ext'
]);

module.exports = {
	description: 'entryFileNames pattern supported in combination with preserveModules',
	options: {
		input: 'src/main.js',
		output: {
			entryFileNames({ name }) {
				assert.ok(expectedNames.has(name), `Unexpected name ${name}.`);
				return '[name]-[format]-[hash].js';
			},
			preserveModules: true
		},
		plugins: [
			{
				name: 'str-plugin',
				transform(code, id) {
					switch (path.extname(id)) {
						case '.str':
							return { code: `export default "${code.trim()}"` };
						default:
							return null;
					}
				}
			}
		]
	}
};
