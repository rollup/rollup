const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'handles treeshake preset true',
	options: {
		treeshake: true,
		plugins: [
			{
				name: 'test',
				buildStart(options) {
					if (!options.treeshake) {
						throw new Error('Treeshaking is not enabled');
					}
					assert.strictEqual(options.treeshake.correctVarValueBeforeDeclaration, false);
					assert.strictEqual(options.treeshake.propertyReadSideEffects, true);
					assert.strictEqual(options.treeshake.tryCatchDeoptimization, true);
					assert.strictEqual(options.treeshake.unknownGlobalSideEffects, true);
					assert.strictEqual(
						options.treeshake.moduleSideEffects(path.join(__dirname, 'dep.js'), false),
						true
					);
				}
			}
		]
	}
});
