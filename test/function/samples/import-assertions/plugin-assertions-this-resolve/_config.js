const assert = require('node:assert');

module.exports = defineTest({
	description: 'allows plugins to provide assertions for this.resolve',
	options: {
		plugins: [
			{
				name: 'first',
				async resolveId() {
					assert.deepStrictEqual(
						await this.resolve('external', undefined, {
							skipSelf: true,
							assertions: { a: 'c', b: 'd' }
						}),
						{
							assertions: { a: 'changed', b: 'changed' },
							external: true,
							id: 'external',
							meta: {},
							moduleSideEffects: true,
							resolvedBy: 'third',
							syntheticNamedExports: false
						}
					);
				}
			},
			{
				name: 'second',
				async resolveId(source, importer, { assertions }) {
					if (source === 'external') {
						return this.resolve(source, importer, { assertions, skipSelf: true });
					}
				}
			},
			{
				name: 'third',
				async resolveId(source, importer, { assertions }) {
					if (source === 'external') {
						return {
							id: source,
							external: true,
							assertions: Object.fromEntries(Object.keys(assertions).map(key => [key, 'changed']))
						};
					}
				}
			}
		]
	}
});
