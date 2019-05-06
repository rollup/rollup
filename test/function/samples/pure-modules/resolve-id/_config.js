const assert = require('assert');
const sideEffects = [];

// TODO Lukas implement load and transform hooks
module.exports = {
	description: 'does not include modules without used exports if moduleSideEffect is false',
	context: {
		sideEffects
	},
	exports() {
		assert.deepStrictEqual(sideEffects, [
			'sideeffects-false-pureint-false-used-import',
			'sideeffects-null-pureint-false',
			'sideeffects-null-pureint-false-unused-import',
			'sideeffects-null-pureint-false-used-import',
			'sideeffects-true-pureint-false',
			'sideeffects-true-pureint-false-unused-import',
			'sideeffects-true-pureint-false-used-import',
			'sideeffects-false-pureint-true-used-import',
			'sideeffects-null-pureint-true-used-import',
			'sideeffects-true-pureint-true',
			'sideeffects-true-pureint-true-unused-import',
			'sideeffects-true-pureint-true-used-import'
		]);
	},
	options: {
		treeshake: {
			pureInternalModules(id) {
				return JSON.parse(id.split('-')[3]);
			}
		},
		plugins: {
			name: 'test-plugin',
			resolveId(id) {
				if (id[0] !== '/') {
					return {
						id,
						external: false,
						moduleSideEffects: JSON.parse(id.split('-')[1])
					};
				}
			},
			load(id) {
				if (id[0] !== '/') {
					const sideEffects = JSON.parse(id.split('-')[1]);
					const pureInt = JSON.parse(id.split('-')[3]);
					assert.strictEqual(
						this.getModuleInfo(id).hasModuleSideEffects,
						sideEffects === null ? !pureInt : sideEffects
					);
					return `export const value = '${id}'; sideEffects.push(value);`;
				}
			},
			buildEnd() {
				assert.deepStrictEqual(
					Array.from(this.moduleIds)
						.filter(id => id[0] !== '/')
						.sort()
						.map(id => ({ id, hasModuleSideEffects: this.getModuleInfo(id).hasModuleSideEffects })),
					[
						{ id: 'sideeffects-false-pureint-false', hasModuleSideEffects: false },
						{ id: 'sideeffects-false-pureint-false-unused-import', hasModuleSideEffects: false },
						{ id: 'sideeffects-false-pureint-false-used-import', hasModuleSideEffects: false },
						{ id: 'sideeffects-false-pureint-true', hasModuleSideEffects: false },
						{ id: 'sideeffects-false-pureint-true-unused-import', hasModuleSideEffects: false },
						{ id: 'sideeffects-false-pureint-true-used-import', hasModuleSideEffects: false },
						{ id: 'sideeffects-null-pureint-false', hasModuleSideEffects: true },
						{ id: 'sideeffects-null-pureint-false-unused-import', hasModuleSideEffects: true },
						{ id: 'sideeffects-null-pureint-false-used-import', hasModuleSideEffects: true },
						{ id: 'sideeffects-null-pureint-true', hasModuleSideEffects: false },
						{ id: 'sideeffects-null-pureint-true-unused-import', hasModuleSideEffects: false },
						{ id: 'sideeffects-null-pureint-true-used-import', hasModuleSideEffects: false },
						{ id: 'sideeffects-true-pureint-false', hasModuleSideEffects: true },
						{ id: 'sideeffects-true-pureint-false-unused-import', hasModuleSideEffects: true },
						{ id: 'sideeffects-true-pureint-false-used-import', hasModuleSideEffects: true },
						{ id: 'sideeffects-true-pureint-true', hasModuleSideEffects: true },
						{ id: 'sideeffects-true-pureint-true-unused-import', hasModuleSideEffects: true },
						{ id: 'sideeffects-true-pureint-true-used-import', hasModuleSideEffects: true }
					]
				);
			}
		}
	}
};
