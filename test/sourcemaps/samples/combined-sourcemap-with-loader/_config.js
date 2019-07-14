const fs = require('fs');
const buble = require('buble');
const MagicString = require('magic-string');
const assert = require('assert');
const getLocation = require('../../getLocation');
const SourceMapConsumer = require('source-map').SourceMapConsumer;

module.exports = {
	description: 'get combined sourcemap in transforming with loader',
	options: {
		plugins: [
			{
				load(id) {
					const code = fs.readFileSync(id, 'utf-8');
					const out = buble.transform(code, {
						transforms: { modules: false },
						sourceMap: true,
						source: id
					});

					return { code: out.code, map: out.map };
				}
			},
			{
				transform(code, id) {
					const sourcemap = this.getCombinedSourcemap();
					const smc = new SourceMapConsumer(sourcemap);
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
				transform(code, id) {
					const sourcemap = this.getCombinedSourcemap();
					const smc = new SourceMapConsumer(sourcemap);
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
	test(code, map) {
		const smc = new SourceMapConsumer(map);
		testFoo(code, smc);
		testMain(code, smc);
	}
};

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
