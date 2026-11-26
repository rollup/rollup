const assert = require('node:assert/strict');
const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_DATA = path.join(__dirname, 'data.js');

module.exports = defineTest({
	description:
		'lists the resolutions of dynamic imports with attributes in dynamicallyImportedIdResolutions',
	options: {
		plugins: [
			{
				name: 'test',
				buildEnd() {
					assert.deepEqual(this.getModuleInfo(ID_MAIN).dynamicallyImportedIdResolutions, [
						{
							attributes: { type: 'custom' },
							external: false,
							id: `${ID_DATA}?attributes=${encodeURIComponent('{"type":"custom"}')}`,
							meta: {},
							moduleSideEffects: true,
							rawId: ID_DATA,
							resolvedBy: 'rollup',
							syntheticNamedExports: false
						}
					]);
				}
			}
		]
	}
});
