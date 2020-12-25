const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'resolves relative external ids',
	options: {
		external: [path.join(__dirname, 'external.js'), path.join(__dirname, 'nested', 'external.js')],
		plugins: {
			async buildStart() {
				assert.deepStrictEqual(await this.resolve('./external.js'), {
					external: true,
					id: path.join(__dirname, 'external.js'),
					meta: {},
					moduleSideEffects: true,
					syntheticNamedExports: false
				});
				assert.deepStrictEqual(
					await this.resolve('./external.js', path.join(__dirname, 'nested', 'some-file.js')),
					{
						external: true,
						id: path.join(__dirname, 'nested', 'external.js'),
						meta: {},
						moduleSideEffects: true,
						syntheticNamedExports: false
					}
				);
			}
		}
	}
};
