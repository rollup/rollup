const assert = require('node:assert/strict');
const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_STRING = path.join(__dirname, 'string.js');
const ID_EXPRESSION = path.join(__dirname, 'expression.js');

module.exports = defineTest({
	description:
		'lists dynamic imports resolved by the resolveDynamicImport hook in dynamicallyImportedIdResolutions',
	options: {
		plugins: [
			{
				name: 'test',
				resolveDynamicImport(specifier) {
					if (specifier === './string.js') {
						return { id: ID_STRING, meta: { test: 'string' } };
					}
					if (typeof specifier !== 'string') {
						return { id: ID_EXPRESSION, meta: { test: 'expression' } };
					}
				},
				buildEnd() {
					assert.deepEqual(
						this.getModuleInfo(ID_MAIN).dynamicallyImportedIdResolutions.map(({ id, meta }) => ({
							id,
							meta
						})),
						[
							{ id: ID_STRING, meta: { test: 'string' } },
							{ id: ID_EXPRESSION, meta: { test: 'expression' } }
						]
					);
				}
			}
		]
	}
});
