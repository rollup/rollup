const assert = require('assert');
const path = require('path');

const expectedNames = new Set(['foo', 'lorem', 'main', 'nested/bar', 'nested/baz', 'no-ext']);

module.exports = {
	description: 'entryFileNames pattern supported in combination with preserveModules',
	options: {
		input: 'src/main.ts',
		output: {
			entryFileNames({ name }) {
				assert.ok(expectedNames.has(name), `Unexpected name ${name}.`);
				return 'entry-[name]-[format]-[ext][extname][assetExtname].js';
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
