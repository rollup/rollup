const assert = require('assert');
const { readFileSync } = require('fs');
const path = require('path');
const { SourceMapConsumer } = require('source-map');

module.exports = {
	description:
		'allows using the transform hook for annotations only without returning a code property and breaking sourcemaps',
	options: {
		plugins: {
			name: 'test-plugin',
			transform() {
				return { meta: { test: true } };
			},
			async generateBundle(options, bundle) {
				const { code, map } = bundle['main.js'];
				const line = 3;
				const column = 11;
				assert.strictEqual(code.split('\n')[line - 1].substr(column, 2), '42');

				const smc = await new SourceMapConsumer(map);
				const originalLoc = smc.originalPositionFor({ line, column });
				assert.notStrictEqual(originalLoc.line, null);
				const originalCode = readFileSync(path.join(__dirname, 'main.js'), 'utf8');
				assert.strictEqual(
					originalCode.split('\n')[originalLoc.line - 1].substr(originalLoc.column, 2),
					'42'
				);

				for (const id of this.getModuleIds()) {
					assert.strictEqual(this.getModuleInfo(id).meta.test, true);
				}
			}
		},
		output: {
			sourcemap: true
		}
	}
};
