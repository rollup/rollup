const assert = require('assert');
const sideEffects = [];

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
			'pure-true-external-true-used-import',
			'pure-false-external-true-unused-import',
			'pure-false-external-true-used-import',
			'pure-false-external-false',
			'pure-true-external-false-used-import',
			'pure-false-external-false-unused-import',
			'pure-false-external-false-used-import'
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
					return `export const value = '${id}'; sideEffects.push(value);`;
				}
			}
		}
	},
	warnings: [
		{
			code: 'UNUSED_EXTERNAL_IMPORT',
			message:
				"'value' is imported from external module 'pure-true-external-true-unused-import' but never used",
			names: ['value'],
			source: 'pure-true-external-true-unused-import'
		},
		{
			code: 'UNUSED_EXTERNAL_IMPORT',
			message:
				"'value' is imported from external module 'pure-false-external-true-unused-import' but never used",
			names: ['value'],
			source: 'pure-false-external-true-unused-import'
		}
	]
};
