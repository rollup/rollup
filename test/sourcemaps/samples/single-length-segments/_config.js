const fs = require('fs');
const path = require('path');
const assert = require('assert');
const getLocation = require('../../getLocation');
const SourceMapConsumer = require('source-map').SourceMapConsumer;

const original = fs.readFileSync(path.resolve(__dirname, 'main.js'), 'utf-8');

module.exports = {
	description: 'handles single-length sourcemap segments',
	options: {
		plugins: [
			{
				transform() {
					return {
						code: fs.readFileSync(path.resolve(__dirname, 'output.js'), 'utf-8'),
						map: fs.readFileSync(path.resolve(__dirname, 'output.js.map'), 'utf-8')
					};
				}
			}
		],
		output: {
			name: 'x'
		}
	},
	test(code, map) {
		const smc = new SourceMapConsumer(map);

		['Foo', 'log'].forEach((token) => {
			const generatedLoc = getLocation(code, code.indexOf(token));
			const originalLoc = smc.originalPositionFor(generatedLoc);
			const expectedLoc = getLocation(original, original.indexOf(token));

			assert.ok(/main/.test(originalLoc.source));
			assert.equal(originalLoc.line, expectedLoc.line);
			assert.equal(originalLoc.column, expectedLoc.column);
		});
	}
};
