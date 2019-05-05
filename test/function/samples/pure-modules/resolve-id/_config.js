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
			'pure-false-pureint-false',
			'pure-false-pureint-false-unused-import',
			'pure-false-pureint-false-used-import',
			'pure-null-pureint-false',
			'pure-null-pureint-false-unused-import',
			'pure-null-pureint-false-used-import',
			'pure-true-pureint-false-used-import',
			'pure-false-pureint-true',
			'pure-false-pureint-true-unused-import',
			'pure-false-pureint-true-used-import',
			'pure-null-pureint-true-used-import',
			'pure-true-pureint-true-used-import'
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
						pure: JSON.parse(id.split('-')[1])
					};
				}
			},
			load(id) {
				if (id[0] !== '/') {
					const pure = JSON.parse(id.split('-')[1]);
					const pureInt = JSON.parse(id.split('-')[3]);
					assert.strictEqual(this.getModuleInfo(id).isPure, pure === null ? pureInt : pure);
					return `export const value = '${id}'; sideEffects.push(value);`;
				}
			},
			buildEnd() {
				assert.deepStrictEqual(
					Array.from(this.moduleIds)
						.filter(id => id[0] !== '/')
						.sort()
						.map(id => ({ id, isPure: this.getModuleInfo(id).isPure })),
					[
						{ id: 'pure-false-pureint-false', isPure: false },
						{ id: 'pure-false-pureint-false-unused-import', isPure: false },
						{ id: 'pure-false-pureint-false-used-import', isPure: false },
						{ id: 'pure-false-pureint-true', isPure: false },
						{ id: 'pure-false-pureint-true-unused-import', isPure: false },
						{ id: 'pure-false-pureint-true-used-import', isPure: false },
						{ id: 'pure-null-pureint-false', isPure: false },
						{ id: 'pure-null-pureint-false-unused-import', isPure: false },
						{ id: 'pure-null-pureint-false-used-import', isPure: false },
						{ id: 'pure-null-pureint-true', isPure: true },
						{ id: 'pure-null-pureint-true-unused-import', isPure: true },
						{ id: 'pure-null-pureint-true-used-import', isPure: true },
						{ id: 'pure-true-pureint-false', isPure: true },
						{ id: 'pure-true-pureint-false-unused-import', isPure: true },
						{ id: 'pure-true-pureint-false-used-import', isPure: true },
						{ id: 'pure-true-pureint-true', isPure: true },
						{ id: 'pure-true-pureint-true-unused-import', isPure: true },
						{ id: 'pure-true-pureint-true-used-import', isPure: true }
					]
				);
			}
		}
	}
};
