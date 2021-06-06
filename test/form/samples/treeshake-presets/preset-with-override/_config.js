const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'allows using the "preset" option with overrides',
	options: {
		treeshake: {
			preset: 'smallest',
			unknownGlobalSideEffects: true
		},
		plugins: [
			{
				buildStart(options) {
					assert.strictEqual(options.treeshake.propertyReadSideEffects, false);
					assert.strictEqual(options.treeshake.tryCatchDeoptimization, false);
					assert.strictEqual(options.treeshake.unknownGlobalSideEffects, true);
					assert.strictEqual(
						options.treeshake.moduleSideEffects(path.join(__dirname, 'dep.js')),
						false
					);
				}
			}
		]
	}
};
