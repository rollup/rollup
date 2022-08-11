const assert = require('node:assert');
const path = require('node:path');
const { loadConfigFile } = require('../../dist/loadConfigFile.js');

describe('loadConfigFile', () => {
	it('loads a config file', async () => {
		const { options, warnings } = await loadConfigFile(
			path.resolve(__dirname, 'samples/basic/rollup.config.js')
		);
		assert.strictEqual(warnings.count, 0);
		assert.deepStrictEqual(JSON.parse(JSON.stringify(options)), [
			{
				external: [],
				input: 'my-input',
				output: [
					{
						file: 'my-file',
						format: 'es',
						plugins: []
					}
				],
				plugins: [
					{
						name: 'stdin'
					}
				]
			}
		]);
	});
});
