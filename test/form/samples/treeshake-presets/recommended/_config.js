const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'handles treeshake preset "recommended"',
	options: {
		treeshake: 'recommended',
		plugins: [
			{
				buildStart(options) {
					assert.strictEqual(options.treeshake.propertyReadSideEffects, true);
					assert.strictEqual(options.treeshake.tryCatchDeoptimization, true);
					assert.strictEqual(options.treeshake.unknownGlobalSideEffects, false);
					assert.strictEqual(
						options.treeshake.moduleSideEffects(path.join(__dirname, 'dep.js')),
						true
					);
				}
			}
		]
	}
};
