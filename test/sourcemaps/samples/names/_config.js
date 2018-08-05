const assert = require('assert');
const getLocation = require('../../getLocation');
const SourceMapConsumer = require('source-map').SourceMapConsumer;

module.exports = {
	description: 'names are recovered (https://github.com/rollup/rollup/issues/101)',
	options: {
		output: {
			name: 'myModule'
		}
	},
	test(code, map) {
		const smc = new SourceMapConsumer(map);

		let pattern = /Object\.create\( ([\w$\d]+)\.prototype \)/;
		let match = pattern.exec(code);

		let generatedLoc = getLocation(code, match.index + 'Object.create ( '.length);
		let original = smc.originalPositionFor(generatedLoc);
		assert.equal(original.name, 'Bar');

		pattern = /function Foo([\w$\d]+)/;
		match = pattern.exec(code);

		generatedLoc = getLocation(code, match.index + 'function '.length);
		original = smc.originalPositionFor(generatedLoc);
		assert.equal(original.name, 'Foo');
	}
};
