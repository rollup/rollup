const path = require('path');

module.exports = {
	description: 'replaces missing namespace members with undefined and warns about them',
	warnings: [
		{
			code: 'MISSING_EXPORT',
			exporter: 'empty.js',
			importer: 'main.js',
			id: path.join(__dirname, 'main.js'),
			missing: 'foo',
			message: `'foo' is not exported by 'empty.js'`,
			pos: 61,
			loc: {
				file: require('path').resolve(__dirname, 'main.js'),
				line: 3,
				column: 25
			},
			frame: `
				1: import * as mod from './empty.js';
				2:
				3: assert.equal( typeof mod.foo, 'undefined' );
				                            ^
			`,
			url: `https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module`
		}
	]
};
