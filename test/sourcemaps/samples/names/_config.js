const assert = require('node:assert');
const { SourceMapConsumer } = require('source-map');
const getLocation = require('../../getLocation');

module.exports = defineTest({
	description: 'names are recovered (https://github.com/rollup/rollup/issues/101)',
	options: {
		output: {
			name: 'myModule'
		}
	},
	async test(code, map) {
		const smc = await new SourceMapConsumer(map);

		let pattern = /Object\.create\( ([\w$]+)\.prototype \)/;
		let match = pattern.exec(code);

		let generatedLoc = getLocation(code, match.index + 'Object.create ( '.length);
		let original = smc.originalPositionFor(generatedLoc);
		assert.equal(original.name, 'Bar');

		pattern = /function Foo([\w$]+)/;
		match = pattern.exec(code);

		generatedLoc = getLocation(code, match.index + 'function '.length);
		original = smc.originalPositionFor(generatedLoc);
		assert.equal(original.name, 'Foo');
	}
});
