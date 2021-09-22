const assert = require('assert');
const fs = require('fs');
const path = require('path');

module.exports = {
	description: 'supports namespaces with external star reexports',
	options: {
		external: ['fs', 'path'],
		plugins: {
			transform(code, id) {
				if (id.endsWith('override.js')) {
					return {
						code,
						syntheticNamedExports: true
					};
				}
				return null;
			}
		}
	},
	exports(exports) {
		assert.strictEqual(exports.fs.readFile, fs.readFile);
		assert.deepStrictEqual(Object.keys(exports.fs), Object.keys(fs));
		assert.strictEqual(exports.fsOverride.readFile, 'override');
		assert.strictEqual(exports.fsOverride.extra, 'extra');
		assert.strictEqual(exports.fsOverride.synthetic, 'synthetic');
		assert.strictEqual(exports.fsOverride.readFileSync, fs.readFileSync);
		assert.strictEqual(exports.fsOverride.dirname, path.dirname);
	}
};
