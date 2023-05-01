const assert = require('node:assert');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const cachedModules = {
	'@main.js': 'import foo from "./foo"; export default foo();'
};

module.exports = defineTest({
	description: 'applies custom resolver to entry point',
	options: {
		plugins: [
			{
				resolveId(importee, importer) {
					if (importer === undefined) {
						return '@' + path.relative(__dirname, importee);
					}

					if (importer[0] === '@') {
						return path.join(__dirname, importee) + '.js';
					}
				},
				load(moduleId) {
					if (moduleId[0] === '@') {
						return cachedModules[moduleId];
					}

					return readFileSync(moduleId, 'utf8');
				}
			}
		]
	},
	exports(exports) {
		assert.equal(exports, 42);
	}
});
