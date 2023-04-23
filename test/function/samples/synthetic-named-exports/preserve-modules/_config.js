const assert = require('node:assert');

module.exports = defineTest({
	description: 'handles a dynamic import with synthetic named exports in preserveModules mode',
	options: {
		output: {
			preserveModules: true
		},
		plugins: [
			{
				name: 'test',
				transform() {
					return {
						syntheticNamedExports: '__synthetic'
					};
				}
			}
		]
	},
	async exports(exports) {
		const { foo } = await exports.promise;
		assert.strictEqual(foo, 'bar');
	}
});
