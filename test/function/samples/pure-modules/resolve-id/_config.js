const assert = require('assert');
const sideEffects = [];

// TODO Lukas implement load and transform hooks
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
			'pure-false-external-true-pureint-false-pureext-false',
			'pure-false-external-true-pureint-false-pureext-false-unused-import',
			'pure-false-external-true-pureint-false-pureext-false-used-import',
			'pure-null-external-true-pureint-false-pureext-false',
			'pure-null-external-true-pureint-false-pureext-false-unused-import',
			'pure-null-external-true-pureint-false-pureext-false-used-import',
			'pure-true-external-true-pureint-false-pureext-false-used-import',
			'pure-false-external-true-pureint-true-pureext-false',
			'pure-false-external-true-pureint-true-pureext-false-unused-import',
			'pure-false-external-true-pureint-true-pureext-false-used-import',
			'pure-null-external-true-pureint-true-pureext-false',
			'pure-null-external-true-pureint-true-pureext-false-unused-import',
			'pure-null-external-true-pureint-true-pureext-false-used-import',
			'pure-true-external-true-pureint-true-pureext-false-used-import',
			'pure-false-external-true-pureint-false-pureext-true',
			'pure-false-external-true-pureint-false-pureext-true-unused-import',
			'pure-false-external-true-pureint-false-pureext-true-used-import',
			'pure-null-external-true-pureint-false-pureext-true-used-import',
			'pure-true-external-true-pureint-false-pureext-true-used-import',
			'pure-false-external-true-pureint-true-pureext-true',
			'pure-false-external-true-pureint-true-pureext-true-unused-import',
			'pure-false-external-true-pureint-true-pureext-true-used-import',
			'pure-null-external-true-pureint-true-pureext-true-used-import',
			'pure-true-external-true-pureint-true-pureext-true-used-import',
			'pure-false-external-false-pureint-false-pureext-false',
			'pure-false-external-false-pureint-false-pureext-false-unused-import',
			'pure-false-external-false-pureint-false-pureext-false-used-import',
			'pure-null-external-false-pureint-false-pureext-false',
			'pure-null-external-false-pureint-false-pureext-false-unused-import',
			'pure-null-external-false-pureint-false-pureext-false-used-import',
			'pure-true-external-false-pureint-false-pureext-false-used-import',
			'pure-false-external-false-pureint-true-pureext-false',
			'pure-false-external-false-pureint-true-pureext-false-unused-import',
			'pure-false-external-false-pureint-true-pureext-false-used-import',
			'pure-null-external-false-pureint-true-pureext-false-used-import',
			'pure-true-external-false-pureint-true-pureext-false-used-import',
			'pure-false-external-false-pureint-false-pureext-true',
			'pure-false-external-false-pureint-false-pureext-true-unused-import',
			'pure-false-external-false-pureint-false-pureext-true-used-import',
			'pure-null-external-false-pureint-false-pureext-true',
			'pure-null-external-false-pureint-false-pureext-true-unused-import',
			'pure-null-external-false-pureint-false-pureext-true-used-import',
			'pure-true-external-false-pureint-false-pureext-true-used-import',
			'pure-false-external-false-pureint-true-pureext-true',
			'pure-false-external-false-pureint-true-pureext-true-unused-import',
			'pure-false-external-false-pureint-true-pureext-true-used-import',
			'pure-null-external-false-pureint-true-pureext-true-used-import',
			'pure-true-external-false-pureint-true-pureext-true-used-import'
		]);
	},
	options: {
		treeshake: {
			pureExternalModules(id) {
				return JSON.parse(id.split('-')[7]);
			},
			pureInternalModules(id) {
				return JSON.parse(id.split('-')[5]);
			}
		},
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
					const pureInt = JSON.parse(id.split('-')[5]);
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
						{ id: 'pure-false-external-false-pureint-false-pureext-false', isPure: false },
						{
							id: 'pure-false-external-false-pureint-false-pureext-false-unused-import',
							isPure: false
						},
						{
							id: 'pure-false-external-false-pureint-false-pureext-false-used-import',
							isPure: false
						},
						{ id: 'pure-false-external-false-pureint-false-pureext-true', isPure: false },
						{
							id: 'pure-false-external-false-pureint-false-pureext-true-unused-import',
							isPure: false
						},
						{
							id: 'pure-false-external-false-pureint-false-pureext-true-used-import',
							isPure: false
						},
						{ id: 'pure-false-external-false-pureint-true-pureext-false', isPure: false },
						{
							id: 'pure-false-external-false-pureint-true-pureext-false-unused-import',
							isPure: false
						},
						{
							id: 'pure-false-external-false-pureint-true-pureext-false-used-import',
							isPure: false
						},
						{ id: 'pure-false-external-false-pureint-true-pureext-true', isPure: false },
						{
							id: 'pure-false-external-false-pureint-true-pureext-true-unused-import',
							isPure: false
						},
						{
							id: 'pure-false-external-false-pureint-true-pureext-true-used-import',
							isPure: false
						},
						{ id: 'pure-false-external-true-pureint-false-pureext-false', isPure: false },
						{
							id: 'pure-false-external-true-pureint-false-pureext-false-unused-import',
							isPure: false
						},
						{
							id: 'pure-false-external-true-pureint-false-pureext-false-used-import',
							isPure: false
						},
						{ id: 'pure-false-external-true-pureint-false-pureext-true', isPure: false },
						{
							id: 'pure-false-external-true-pureint-false-pureext-true-unused-import',
							isPure: false
						},
						{
							id: 'pure-false-external-true-pureint-false-pureext-true-used-import',
							isPure: false
						},
						{ id: 'pure-false-external-true-pureint-true-pureext-false', isPure: false },
						{
							id: 'pure-false-external-true-pureint-true-pureext-false-unused-import',
							isPure: false
						},
						{
							id: 'pure-false-external-true-pureint-true-pureext-false-used-import',
							isPure: false
						},
						{ id: 'pure-false-external-true-pureint-true-pureext-true', isPure: false },
						{
							id: 'pure-false-external-true-pureint-true-pureext-true-unused-import',
							isPure: false
						},
						{ id: 'pure-false-external-true-pureint-true-pureext-true-used-import', isPure: false },
						{ id: 'pure-null-external-false-pureint-false-pureext-false', isPure: false },
						{
							id: 'pure-null-external-false-pureint-false-pureext-false-unused-import',
							isPure: false
						},
						{
							id: 'pure-null-external-false-pureint-false-pureext-false-used-import',
							isPure: false
						},
						{ id: 'pure-null-external-false-pureint-false-pureext-true', isPure: false },
						{
							id: 'pure-null-external-false-pureint-false-pureext-true-unused-import',
							isPure: false
						},
						{
							id: 'pure-null-external-false-pureint-false-pureext-true-used-import',
							isPure: false
						},
						{ id: 'pure-null-external-false-pureint-true-pureext-false', isPure: true },
						{
							id: 'pure-null-external-false-pureint-true-pureext-false-unused-import',
							isPure: true
						},
						{ id: 'pure-null-external-false-pureint-true-pureext-false-used-import', isPure: true },
						{ id: 'pure-null-external-false-pureint-true-pureext-true', isPure: true },
						{
							id: 'pure-null-external-false-pureint-true-pureext-true-unused-import',
							isPure: true
						},
						{ id: 'pure-null-external-false-pureint-true-pureext-true-used-import', isPure: true },
						{ id: 'pure-null-external-true-pureint-false-pureext-false', isPure: false },
						{
							id: 'pure-null-external-true-pureint-false-pureext-false-unused-import',
							isPure: false
						},
						{
							id: 'pure-null-external-true-pureint-false-pureext-false-used-import',
							isPure: false
						},
						{ id: 'pure-null-external-true-pureint-false-pureext-true', isPure: true },
						{
							id: 'pure-null-external-true-pureint-false-pureext-true-unused-import',
							isPure: true
						},
						{ id: 'pure-null-external-true-pureint-false-pureext-true-used-import', isPure: true },
						{ id: 'pure-null-external-true-pureint-true-pureext-false', isPure: false },
						{
							id: 'pure-null-external-true-pureint-true-pureext-false-unused-import',
							isPure: false
						},
						{ id: 'pure-null-external-true-pureint-true-pureext-false-used-import', isPure: false },
						{ id: 'pure-null-external-true-pureint-true-pureext-true', isPure: true },
						{ id: 'pure-null-external-true-pureint-true-pureext-true-unused-import', isPure: true },
						{ id: 'pure-null-external-true-pureint-true-pureext-true-used-import', isPure: true },
						{ id: 'pure-true-external-false-pureint-false-pureext-false', isPure: true },
						{
							id: 'pure-true-external-false-pureint-false-pureext-false-unused-import',
							isPure: true
						},
						{
							id: 'pure-true-external-false-pureint-false-pureext-false-used-import',
							isPure: true
						},
						{ id: 'pure-true-external-false-pureint-false-pureext-true', isPure: true },
						{
							id: 'pure-true-external-false-pureint-false-pureext-true-unused-import',
							isPure: true
						},
						{ id: 'pure-true-external-false-pureint-false-pureext-true-used-import', isPure: true },
						{ id: 'pure-true-external-false-pureint-true-pureext-false', isPure: true },
						{
							id: 'pure-true-external-false-pureint-true-pureext-false-unused-import',
							isPure: true
						},
						{ id: 'pure-true-external-false-pureint-true-pureext-false-used-import', isPure: true },
						{ id: 'pure-true-external-false-pureint-true-pureext-true', isPure: true },
						{
							id: 'pure-true-external-false-pureint-true-pureext-true-unused-import',
							isPure: true
						},
						{ id: 'pure-true-external-false-pureint-true-pureext-true-used-import', isPure: true },
						{ id: 'pure-true-external-true-pureint-false-pureext-false', isPure: true },
						{
							id: 'pure-true-external-true-pureint-false-pureext-false-unused-import',
							isPure: true
						},
						{ id: 'pure-true-external-true-pureint-false-pureext-false-used-import', isPure: true },
						{ id: 'pure-true-external-true-pureint-false-pureext-true', isPure: true },
						{
							id: 'pure-true-external-true-pureint-false-pureext-true-unused-import',
							isPure: true
						},
						{ id: 'pure-true-external-true-pureint-false-pureext-true-used-import', isPure: true },
						{ id: 'pure-true-external-true-pureint-true-pureext-false', isPure: true },
						{
							id: 'pure-true-external-true-pureint-true-pureext-false-unused-import',
							isPure: true
						},
						{ id: 'pure-true-external-true-pureint-true-pureext-false-used-import', isPure: true },
						{ id: 'pure-true-external-true-pureint-true-pureext-true', isPure: true },
						{ id: 'pure-true-external-true-pureint-true-pureext-true-unused-import', isPure: true },
						{ id: 'pure-true-external-true-pureint-true-pureext-true-used-import', isPure: true }
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
