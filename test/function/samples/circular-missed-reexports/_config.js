const assert = require('node:assert');
const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_DEP1 = path.join(__dirname, 'dep1.js');
const ID_DEP2 = path.join(__dirname, 'dep2.js');

module.exports = defineTest({
	description: 'handles circular reexports',
	exports(exports) {
		assert.strictEqual(exports.exists, 42);
	},
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_DEP1, ID_DEP2, ID_DEP1],
			message: 'Circular dependency: dep1.js -> dep2.js -> dep1.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_DEP1, ID_DEP1],
			message: 'Circular dependency: dep1.js -> dep1.js'
		},
		{
			binding: 'doesNotExist',
			code: 'MISSING_EXPORT',
			id: ID_MAIN,
			message:
				'main.js (1:17): "doesNotExist" is not exported by "dep1.js", imported by "main.js".',
			exporter: ID_DEP1,
			pos: 17,
			loc: {
				file: ID_MAIN,
				line: 1,
				column: 17
			},
			frame: `
1: import { exists, doesNotExist } from './dep1.js';
                    ^
2: export { exists };`,
			url: 'https://rollupjs.org/troubleshooting/#error-name-is-not-exported-by-module'
		},
		{
			code: 'CYCLIC_CROSS_CHUNK_REEXPORT',
			exporter: ID_DEP1,
			id: ID_MAIN,
			message:
				'Export "exists" of module "dep1.js" was reexported through module "dep2.js" while both modules are dependencies of each other and will end up in different chunks by current Rollup settings. This scenario is not well supported at the moment as it will produce a circular dependency between chunks and will likely lead to broken execution order.\nEither change the import in "main.js" to point directly to the exporting module or reconfigure "output.manualChunks" to ensure these modules end up in the same chunk.',
			reexporter: ID_DEP2
		}
	]
});
