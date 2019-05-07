const assert = require('assert');
const sideEffects = [];

module.exports = {
	solo: true,
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
			'sideeffects-false-usereffects-true',
			'sideeffects-false-usereffects-true-unused-import',
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
				return JSON.parse(id.split('-')[3]);
			}
		},
		plugins: {
			name: 'test-plugin',
			resolveId(id) {
				if (id[0] !== '/') {
					return {
						id,
						external: true,
						moduleSideEffects: JSON.parse(id.split('-')[1])
					};
				}
			},
			buildEnd() {
				assert.deepStrictEqual(
					Array.from(this.moduleIds)
						.filter(id => id[0] !== '/')
						.sort()
						.map(id => ({ id, hasModuleSideEffects: this.getModuleInfo(id).hasModuleSideEffects })),
					[
						{ id: 'sideeffects-false-usereffects-false', hasModuleSideEffects: false },
						{
							id: 'sideeffects-false-usereffects-false-unused-import',
							hasModuleSideEffects: false
						},
						{ id: 'sideeffects-false-usereffects-false-used-import', hasModuleSideEffects: false },
						{ id: 'sideeffects-false-usereffects-true', hasModuleSideEffects: true },
						{ id: 'sideeffects-false-usereffects-true-unused-import', hasModuleSideEffects: true },
						{ id: 'sideeffects-false-usereffects-true-used-import', hasModuleSideEffects: true },
						{ id: 'sideeffects-null-usereffects-false', hasModuleSideEffects: false },
						{ id: 'sideeffects-null-usereffects-false-unused-import', hasModuleSideEffects: false },
						{ id: 'sideeffects-null-usereffects-false-used-import', hasModuleSideEffects: false },
						{ id: 'sideeffects-null-usereffects-true', hasModuleSideEffects: true },
						{ id: 'sideeffects-null-usereffects-true-unused-import', hasModuleSideEffects: true },
						{ id: 'sideeffects-null-usereffects-true-used-import', hasModuleSideEffects: true },
						{ id: 'sideeffects-true-usereffects-false', hasModuleSideEffects: true },
						{ id: 'sideeffects-true-usereffects-false-unused-import', hasModuleSideEffects: true },
						{ id: 'sideeffects-true-usereffects-false-used-import', hasModuleSideEffects: true },
						{ id: 'sideeffects-true-usereffects-true', hasModuleSideEffects: true },
						{ id: 'sideeffects-true-usereffects-true-unused-import', hasModuleSideEffects: true },
						{ id: 'sideeffects-true-usereffects-true-used-import', hasModuleSideEffects: true }
					]
				);
			}
		}
	},
	warnings(warnings) {
		for (const warning of warnings) {
			assert.strictEqual(warning.code, 'UNUSED_EXTERNAL_IMPORT');
		}
	}
};
