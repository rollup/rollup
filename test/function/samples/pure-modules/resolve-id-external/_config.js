const assert = require('assert');
const sideEffects = [];

module.exports = {
	description: 'does not include modules without used exports if moduleSideEffect is false',
	context: {
		require(id) {
			sideEffects.push(id);
			return { value: id };
		}
	},
	exports() {
		assert.deepStrictEqual(sideEffects, [
			'sideeffects-false-pureext-false-used-import',
			'sideeffects-null-pureext-false',
			'sideeffects-null-pureext-false-unused-import',
			'sideeffects-null-pureext-false-used-import',
			'sideeffects-true-pureext-false',
			'sideeffects-true-pureext-false-unused-import',
			'sideeffects-true-pureext-false-used-import',
			'sideeffects-false-pureext-true-used-import',
			'sideeffects-null-pureext-true-used-import',
			'sideeffects-true-pureext-true',
			'sideeffects-true-pureext-true-unused-import',
			'sideeffects-true-pureext-true-used-import'
		]);
	},
	options: {
		treeshake: {
			pureExternalModules(id) {
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
						{ id: 'sideeffects-false-pureext-false', hasModuleSideEffects: false },
						{ id: 'sideeffects-false-pureext-false-unused-import', hasModuleSideEffects: false },
						{ id: 'sideeffects-false-pureext-false-used-import', hasModuleSideEffects: false },
						{ id: 'sideeffects-false-pureext-true', hasModuleSideEffects: false },
						{ id: 'sideeffects-false-pureext-true-unused-import', hasModuleSideEffects: false },
						{ id: 'sideeffects-false-pureext-true-used-import', hasModuleSideEffects: false },
						{ id: 'sideeffects-null-pureext-false', hasModuleSideEffects: true },
						{ id: 'sideeffects-null-pureext-false-unused-import', hasModuleSideEffects: true },
						{ id: 'sideeffects-null-pureext-false-used-import', hasModuleSideEffects: true },
						{ id: 'sideeffects-null-pureext-true', hasModuleSideEffects: false },
						{ id: 'sideeffects-null-pureext-true-unused-import', hasModuleSideEffects: false },
						{ id: 'sideeffects-null-pureext-true-used-import', hasModuleSideEffects: false },
						{ id: 'sideeffects-true-pureext-false', hasModuleSideEffects: true },
						{ id: 'sideeffects-true-pureext-false-unused-import', hasModuleSideEffects: true },
						{ id: 'sideeffects-true-pureext-false-used-import', hasModuleSideEffects: true },
						{ id: 'sideeffects-true-pureext-true', hasModuleSideEffects: true },
						{ id: 'sideeffects-true-pureext-true-unused-import', hasModuleSideEffects: true },
						{ id: 'sideeffects-true-pureext-true-used-import', hasModuleSideEffects: true }
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
