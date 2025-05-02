const assert = require('node:assert');
const { Volume } = require('memfs');
const rollup = require('../../dist/rollup');

describe('fs-override', () => {
	it('uses fs from options', async () => {
		const vol = Volume.fromJSON(
			{
				'/input.js': "console.log('Hello, Rollup!');"
			},
			__dirname
		);
		const bundle = await rollup.rollup({
			input: '/input.js',
			fs: vol.promises
		});

		await bundle.write({
			file: '/output.js',
			format: 'esm'
		});

		const generatedCode = vol.readFileSync('/output.js', 'utf8');
		assert.strictEqual(generatedCode.trim(), "console.log('Hello, Rollup!');");
	});
});
