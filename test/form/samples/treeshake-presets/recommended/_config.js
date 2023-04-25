const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'handles treeshake preset "recommended"',
	options: {
		treeshake: 'recommended',
		plugins: [
			{
				name: 'test-plugin',
				buildStart(options) {
					if (!options.treeshake) {
						throw new Error('Treeshaking options not found');
					}
					assert.strictEqual(options.treeshake.correctVarValueBeforeDeclaration, false);
					assert.strictEqual(options.treeshake.propertyReadSideEffects, true);
					assert.strictEqual(options.treeshake.tryCatchDeoptimization, true);
					assert.strictEqual(options.treeshake.unknownGlobalSideEffects, false);
					assert.strictEqual(
						options.treeshake.moduleSideEffects(path.join(__dirname, 'dep.js'), false),
						true
					);
				}
			}
		]
	}
});
