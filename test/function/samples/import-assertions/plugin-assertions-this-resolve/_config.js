const assert = require('node:assert');

module.exports = defineTest({
	description: 'allows plugins to provide attributes for this.resolve',
	options: {
		plugins: [
			{
				name: 'first',
				async resolveId() {
					assert.deepStrictEqual(
						await this.resolve('external', undefined, {
							attributes: { a: 'c', b: 'd' }
						}),
						{
							attributes: { a: 'changed', b: 'changed' },
							external: true,
							id: 'external?a=changed&b=changed',
							meta: {},
							moduleSideEffects: true,
							resolvedBy: 'third',
							rawId: 'external',
							syntheticNamedExports: false
						}
					);
				}
			},
			{
				name: 'second',
				async resolveId(source, importer, { attributes }) {
					if (source === 'external') {
						return this.resolve(source, importer, { attributes });
					}
				}
			},
			{
				name: 'third',
				async resolveId(source, importer, { attributes }) {
					if (source === 'external') {
						return {
							rawId: source,
							external: true,
							attributes: Object.fromEntries(Object.keys(attributes).map(key => [key, 'changed']))
						};
					}
				}
			}
		]
	}
});
