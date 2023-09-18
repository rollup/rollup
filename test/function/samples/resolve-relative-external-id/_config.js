const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'resolves relative external ids',
	options: {
		external: [path.join(__dirname, 'external.js'), path.join(__dirname, 'nested', 'external.js')],
		plugins: [
			{
				async buildStart() {
					assert.deepStrictEqual(await this.resolve('./external.js'), {
						attributes: {},
						external: true,
						id: path.join(__dirname, 'external.js'),
						meta: {},
						moduleSideEffects: true,
						resolvedBy: 'rollup',
						syntheticNamedExports: false
					});
					assert.deepStrictEqual(
						await this.resolve('./external.js', path.join(__dirname, 'nested', 'some-file.js')),
						{
							attributes: {},
							external: true,
							id: path.join(__dirname, 'nested', 'external.js'),
							meta: {},
							moduleSideEffects: true,
							resolvedBy: 'rollup',
							syntheticNamedExports: false
						}
					);
				}
			}
		]
	}
});
