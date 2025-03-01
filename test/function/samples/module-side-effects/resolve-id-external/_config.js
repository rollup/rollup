const assert = require('node:assert');
const path = require('node:path');
/**
 * @type {string[]}
 */
const sideEffects = [];
const { getObject } = require('../../../../testHelpers');

module.exports = defineTest({
	description: 'does not include modules without used exports if moduleSideEffect is false',
	context: {
		require(id) {
			sideEffects.push(id);
			return { value: id };
		}
	},
	exports() {
		assert.deepStrictEqual(sideEffects, [
			'sideeffects-false-usereffects-false-used-import',
			'sideeffects-null-usereffects-false-used-import',
			'sideeffects-true-usereffects-false',
			'sideeffects-true-usereffects-false-unused-import',
			'sideeffects-true-usereffects-false-used-import',
			'sideeffects-false-usereffects-true-used-import',
			'sideeffects-null-usereffects-true',
			'sideeffects-null-usereffects-true-unused-import',
			'sideeffects-null-usereffects-true-used-import',
			'sideeffects-true-usereffects-true',
			'sideeffects-true-usereffects-true-unused-import',
			'sideeffects-true-usereffects-true-used-import'
		]);
	},
	options: {
		treeshake: {
			moduleSideEffects(id) {
				if (id.includes('main')) return true;
				return JSON.parse(id.split('-')[3]);
			}
		},
		plugins: [
			{
				name: 'test-plugin',
				resolveId(id) {
					if (!path.isAbsolute(id)) {
						return {
							id,
							external: true,
							moduleSideEffects: JSON.parse(id.split('-')[1])
						};
					}
				},
				buildEnd() {
					assert.deepStrictEqual(
						getObject(
							[...this.getModuleIds()]
								.filter(id => !path.isAbsolute(id))
								.sort()
								.map(id => [id, this.getModuleInfo(id).moduleSideEffects])
						),
						{
							'sideeffects-false-usereffects-false': false,
							'sideeffects-false-usereffects-false-unused-import': false,
							'sideeffects-false-usereffects-false-used-import': false,
							'sideeffects-false-usereffects-true': false,
							'sideeffects-false-usereffects-true-unused-import': false,
							'sideeffects-false-usereffects-true-used-import': false,
							'sideeffects-null-usereffects-false': false,
							'sideeffects-null-usereffects-false-unused-import': false,
							'sideeffects-null-usereffects-false-used-import': false,
							'sideeffects-null-usereffects-true': true,
							'sideeffects-null-usereffects-true-unused-import': true,
							'sideeffects-null-usereffects-true-used-import': true,
							'sideeffects-true-usereffects-false': true,
							'sideeffects-true-usereffects-false-unused-import': true,
							'sideeffects-true-usereffects-false-used-import': true,
							'sideeffects-true-usereffects-true': true,
							'sideeffects-true-usereffects-true-unused-import': true,
							'sideeffects-true-usereffects-true-used-import': true
						}
					);
				}
			}
		]
	},
	warnings(warnings) {
		for (const warning of warnings) {
			assert.strictEqual(warning.code, 'UNUSED_EXTERNAL_IMPORT');
		}
	}
});
