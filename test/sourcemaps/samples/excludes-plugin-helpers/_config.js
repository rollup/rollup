const assert = require('node:assert');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const HELPER = '\0helper';

module.exports = defineTest({
	description: 'excludes plugin helpers from sources',
	options: {
		output: {
			format: 'cjs'
		},
		plugins: [
			{
				name: 'test-plugin',

				resolveId(id) {
					if (id === HELPER) return id;
				},

				load(id) {
					if (id === HELPER) {
						return readFileSync(path.join(__dirname, 'helper.js'), 'utf8');
					}
				}
			}
		]
	},
	test: (code, map) => {
		assert.equal(map.sources.length, 1);
		assert.equal(map.sourcesContent.length, 1);
		assert.ok(/main/.test(map.sources[0]));
	}
});
