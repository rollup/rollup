const assert = require('assert');
const fs = require('fs');

module.exports = {
	description: 'omits sourcemap comments',
	command: 'rollup -i main.js -f es -m hidden -o output.js',
	test() {
		assert.equal(fs.readFileSync('output.js', 'utf-8').trim(), 'console.log( 42 );');
		fs.unlinkSync('output.js');
		assert.equal(
			fs.readFileSync('output.js.map', 'utf-8').trim(),
			'{"version":3,"file":"output.js","sources":["main.js"],"sourcesContent":["console.log( 42 );\\n"],"names":[],"mappings":"AAAA,OAAO,CAAC,GAAG,EAAE,EAAE,EAAE"}'
		);
		fs.unlinkSync('output.js.map');
	}
};
