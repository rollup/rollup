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
			'pure-false-pureext-false',
			'pure-false-pureext-false-unused-import',
			'pure-false-pureext-false-used-import',
			'pure-null-pureext-false',
			'pure-null-pureext-false-unused-import',
			'pure-null-pureext-false-used-import',
			'pure-true-pureext-false-used-import',
			'pure-false-pureext-true',
			'pure-false-pureext-true-unused-import',
			'pure-false-pureext-true-used-import',
			'pure-null-pureext-true-used-import',
			'pure-true-pureext-true-used-import'
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
						pure: JSON.parse(id.split('-')[1])
					};
				}
			},
			buildEnd() {
				assert.deepStrictEqual(
					Array.from(this.moduleIds)
						.filter(id => id[0] !== '/')
						.sort()
						.map(id => ({ id, isPure: this.getModuleInfo(id).isPure })),
					[
						{ id: 'pure-false-pureext-false', isPure: false },
						{ id: 'pure-false-pureext-false-unused-import', isPure: false },
						{ id: 'pure-false-pureext-false-used-import', isPure: false },
						{ id: 'pure-false-pureext-true', isPure: false },
						{ id: 'pure-false-pureext-true-unused-import', isPure: false },
						{ id: 'pure-false-pureext-true-used-import', isPure: false },
						{ id: 'pure-null-pureext-false', isPure: false },
						{ id: 'pure-null-pureext-false-unused-import', isPure: false },
						{ id: 'pure-null-pureext-false-used-import', isPure: false },
						{ id: 'pure-null-pureext-true', isPure: true },
						{ id: 'pure-null-pureext-true-unused-import', isPure: true },
						{ id: 'pure-null-pureext-true-used-import', isPure: true },
						{ id: 'pure-true-pureext-false', isPure: true },
						{ id: 'pure-true-pureext-false-unused-import', isPure: true },
						{ id: 'pure-true-pureext-false-used-import', isPure: true },
						{ id: 'pure-true-pureext-true', isPure: true },
						{ id: 'pure-true-pureext-true-unused-import', isPure: true },
						{ id: 'pure-true-pureext-true-used-import', isPure: true }
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
