var path = require('path');
var assert = require('assert');
var MagicString = require('magic-string');

module.exports = {
	description: 'error after transform should throw with correct location of file',
	options: {
		plugins: [
			{
				transform: function(source, id) {
					var s = new MagicString(source);
					s.prepend("import _assign from 'object-assign';\n");

					return {
						code: s.toString(),
						map: s.generateMap({ hires: true })
					};
				}
			}
		]
	},
	error: {
		code: 'MISSING_EXPORT',
		message: `'default' is not exported by empty.js`,
		pos: 44,
		loc: {
			file: path.resolve(__dirname, 'main.js'),
			line: 1,
			column: 7
		},
		frame: `
			1: import a from './empty.js';
			          ^
			2:
			3: Object.assign({}, a);
		`,
		url: `https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module`
	}
};
