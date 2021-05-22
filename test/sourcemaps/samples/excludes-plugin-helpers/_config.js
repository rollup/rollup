const assert = require('assert');
const fs = require('fs');
const path = require('path');

const HELPER = '\0helper';

module.exports = {
	description: 'excludes plugin helpers from sources',
	options: {
		output: {
			format: 'cjs'
		},
		plugins: [
			{
				resolveId(id) {
					if (id === HELPER) return id;
				},

				load(id) {
					if (id === HELPER) {
						return fs.readFileSync(path.join(__dirname, 'helper.js'), 'utf-8');
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
};
