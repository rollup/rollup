const assert = require('assert');
const sideEffects = [];

// TODO Lukas interaction with pureExternalModules, use as default?
// TODO Lukas handle other hooks
module.exports = {
	description: 'does not include modules without used exports if moduleSideEffect is false',
	context: {
		sideEffects,
		require(id) {
			sideEffects.push(id);
			return { value: id };
		}
	},
	exports() {
		assert.deepStrictEqual(sideEffects, [
			'pure-false-external-true',
			'pure-false-external-true-unused-import',
			'pure-false-external-true-used-import',
			'pure-null-external-true',
			'pure-null-external-true-unused-import',
			'pure-null-external-true-used-import',
			'pure-true-external-true-used-import',
			'pure-false-external-false',
			'pure-false-external-false-unused-import',
			'pure-false-external-false-used-import',
			'pure-null-external-false',
			'pure-null-external-false-unused-import',
			'pure-null-external-false-used-import',
			'pure-true-external-false-used-import'
		]);
	},
	options: {
		plugins: {
			name: 'test-plugin',
			resolveId(id) {
				if (id[0] !== '/') {
					const [, pure, , external] = id.split('-');
					return {
						id,
						external: JSON.parse(external),
						pure: JSON.parse(pure)
					};
				}
			},
			load(id) {
				if (id[0] !== '/') {
					const pure = JSON.parse(id.split('-')[1]);
					assert.strictEqual(this.getModuleInfo(id).isPure, pure || false);
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
						{ id: 'pure-false-external-false', isPure: false },
						{ id: 'pure-false-external-false-unused-import', isPure: false },
						{ id: 'pure-false-external-false-used-import', isPure: false },
						{ id: 'pure-false-external-true', isPure: false },
						{ id: 'pure-false-external-true-unused-import', isPure: false },
						{ id: 'pure-false-external-true-used-import', isPure: false },
						{ id: 'pure-null-external-false', isPure: false },
						{ id: 'pure-null-external-false-unused-import', isPure: false },
						{ id: 'pure-null-external-false-used-import', isPure: false },
						{ id: 'pure-null-external-true', isPure: false },
						{ id: 'pure-null-external-true-unused-import', isPure: false },
						{ id: 'pure-null-external-true-used-import', isPure: false },
						{ id: 'pure-true-external-false', isPure: true },
						{ id: 'pure-true-external-false-unused-import', isPure: true },
						{ id: 'pure-true-external-false-used-import', isPure: true },
						{ id: 'pure-true-external-true', isPure: true },
						{ id: 'pure-true-external-true-unused-import', isPure: true },
						{ id: 'pure-true-external-true-used-import', isPure: true }
					]
				);
			}
		}
	},
	warnings: [
		{
			code: 'UNUSED_EXTERNAL_IMPORT',
			message:
				"'value' is imported from external module 'pure-false-external-true-unused-import' but never used",
			names: ['value'],
			source: 'pure-false-external-true-unused-import'
		},
		{
			code: 'UNUSED_EXTERNAL_IMPORT',
			message:
				"'value' is imported from external module 'pure-null-external-true-unused-import' but never used",
			names: ['value'],
			source: 'pure-null-external-true-unused-import'
		},
		{
			code: 'UNUSED_EXTERNAL_IMPORT',
			message:
				"'value' is imported from external module 'pure-true-external-true-unused-import' but never used",
			names: ['value'],
			source: 'pure-true-external-true-unused-import'
		}
	]
};
