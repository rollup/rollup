const assert = require('node:assert');
const MagicString = require('magic-string').default;
const { SourceMapConsumer } = require('source-map');
const getLocation = require('../../getLocation');

module.exports = defineTest({
	description: 'get combined sourcemap in transforming',
	options: {
		plugins: [
			{
				name: 'test-plugin1',
				async transform(code, id) {
					const sourcemap = this.getCombinedSourcemap();
					const smc = await new SourceMapConsumer(sourcemap);
					const s = new MagicString(code);

					if (/foo.js$/.test(id)) {
						testFoo(code, smc);

						s.prepend('console.log("foo start");\n\n');
						s.append('\nconsole.log("foo end");');
					} else {
						testMain(code, smc);

						s.appendRight(code.indexOf('console'), 'console.log("main start");\n\n');
						s.append('\nconsole.log("main end");');
					}

					return {
						code: s.toString(),
						map: s.generateMap({ hires: true })
					};
				}
			},
			{
				name: 'test-plugin2',
				async transform(code, id) {
					const sourcemap = this.getCombinedSourcemap();
					const smc = await new SourceMapConsumer(sourcemap);
					const s = new MagicString(code);

					if (/foo.js$/.test(id)) {
						testFoo(code, smc);

						s.prepend('console.log("-- foo ---");\n\n');
						s.append('\nconsole.log("-----");');
					} else {
						testMain(code, smc);

						s.appendRight(code.indexOf('console'), 'console.log("-- main ---");\n\n');
						s.append('\nconsole.log("-----");');
					}

					return {
						code: s.toString(),
						map: s.generateMap({ hires: true })
					};
				}
			}
		]
	},
	async test(code, map) {
		const smc = await new SourceMapConsumer(map);
		testFoo(code, smc);
		testMain(code, smc);
	}
});

function testFoo(code, smc) {
	const generatedLoc = getLocation(code, code.indexOf(42));
	const originalLoc = smc.originalPositionFor(generatedLoc);

	assert.ok(/foo/.test(originalLoc.source));
	assert.equal(originalLoc.line, 1);
	assert.equal(originalLoc.column, 25);
}

function testMain(code, smc) {
	const generatedLoc = getLocation(code, code.indexOf('info'));
	const originalLoc = smc.originalPositionFor(generatedLoc);

	assert.ok(/main/.test(originalLoc.source));
	assert.equal(originalLoc.line, 3);
	assert.equal(originalLoc.column, 8);
}
