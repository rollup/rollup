const path = require('path');
const MagicString = require('magic-string');

module.exports = {
	description: 'error after transform should throw with correct location of file',
	options: {
		plugins: [
			{
				transform(source, id) {
					const s = new MagicString(source);
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
		message: `'default' is not exported by empty.js, imported by main.js`,
		id: path.join(__dirname, 'main.js'),
		pos: 44,
		watchFiles: [path.join(__dirname, 'main.js'), path.join(__dirname, 'empty.js')],
		loc: {
			file: path.join(__dirname, 'main.js'),
			line: 1,
			column: 7
		},
		frame: `
			1: import a from './empty.js';
			          ^
			2:
			3: Object.assign({}, a);
		`,
		url: `https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module`
	}
};
