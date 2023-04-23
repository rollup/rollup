const assert = require('node:assert');
const { promises: fs } = require('node:fs');

module.exports = defineTest({
	description: 'resolves promises between sequential options hooks',
	options: {
		input: 'super-unused',
		treeshake: false,
		plugins: [
			{
				name: 'test-plugin-1',
				async options(options) {
					assert.deepStrictEqual(JSON.parse(JSON.stringify(options)), {
						input: 'super-unused',
						plugins: [{ name: 'test-plugin-1' }, { name: 'test-plugin-2' }],
						strictDeprecations: true,
						treeshake: false
					});
					return { ...options, input: (await fs.readFile('file.txt', 'utf8')).trim() };
				}
			},
			{
				name: 'test-plugin-2',
				options(options) {
					assert.strictEqual(options.input, 'unused');
					return { ...options, input: 'used' };
				}
			}
		]
	}
});
