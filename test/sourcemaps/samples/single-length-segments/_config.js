const assert = require('node:assert');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { SourceMapConsumer } = require('source-map');
const getLocation = require('../../getLocation');

const original = readFileSync(path.resolve(__dirname, 'main.js'), 'utf8');

module.exports = defineTest({
	description: 'handles single-length sourcemap segments',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				transform() {
					return {
						code: readFileSync(path.resolve(__dirname, 'output.js'), 'utf8'),
						map: readFileSync(path.resolve(__dirname, 'output.js.map'), 'utf8')
					};
				}
			}
		],
		output: {
			name: 'x'
		}
	},
	async test(code, map) {
		const smc = await new SourceMapConsumer(map);

		for (const token of ['Foo', 'log']) {
			const generatedLoc = getLocation(code, code.indexOf(token));
			const originalLoc = smc.originalPositionFor(generatedLoc);
			const expectedLoc = getLocation(original, original.indexOf(token));

			assert.ok(/main/.test(originalLoc.source));
			assert.equal(originalLoc.line, expectedLoc.line);
			assert.equal(originalLoc.column, expectedLoc.column);
		}
	}
});
