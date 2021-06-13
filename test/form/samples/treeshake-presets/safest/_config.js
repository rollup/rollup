const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'handles treeshake preset "safest"',
	options: {
		treeshake: 'safest',
		plugins: [
			{
				buildStart(options) {
					assert.strictEqual(options.treeshake.correctVarValueBeforeDeclaration, true);
					assert.strictEqual(options.treeshake.propertyReadSideEffects, true);
					assert.strictEqual(options.treeshake.tryCatchDeoptimization, true);
					assert.strictEqual(options.treeshake.unknownGlobalSideEffects, true);
					assert.strictEqual(
						options.treeshake.moduleSideEffects(path.join(__dirname, 'dep.js')),
						true
					);
				}
			}
		]
	}
};
