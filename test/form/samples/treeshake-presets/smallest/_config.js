const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'handles treeshake preset "smallest"',
	options: {
		treeshake: 'smallest',
		plugins: [
			{
				buildStart(options) {
					assert.strictEqual(options.treeshake.propertyReadSideEffects, false);
					assert.strictEqual(options.treeshake.tryCatchDeoptimization, false);
					assert.strictEqual(options.treeshake.unknownGlobalSideEffects, false);
					assert.strictEqual(
						options.treeshake.moduleSideEffects(path.join(__dirname, 'dep.js')),
						false
					);
				}
			}
		]
	}
};
