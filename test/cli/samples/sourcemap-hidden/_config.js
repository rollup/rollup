const assert = require('node:assert');
const { readFileSync, unlinkSync } = require('node:fs');

module.exports = defineTest({
	description: 'omits sourcemap comments',
	spawnArgs: ['-i', 'main.js', '-f', 'es', '-m', 'hidden', '-o', 'output.js'],
	test() {
		assert.equal(readFileSync('output.js', 'utf8').trim(), 'console.log( 42 );');
		unlinkSync('output.js');
		assert.equal(
			readFileSync('output.js.map', 'utf8').trim(),
			'{"version":3,"file":"output.js","sources":["main.js"],"sourcesContent":["console.log( 42 );\\n"],"names":[],"mappings":"AAAA,OAAO,CAAC,GAAG,EAAE,EAAE,EAAE"}'
		);
		unlinkSync('output.js.map');
	}
});
