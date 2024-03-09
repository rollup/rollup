const path = require('node:path');
const MagicString = require('magic-string');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_EMPTY = path.join(__dirname, 'empty.js');

module.exports = defineTest({
	description: 'error after transform should throw with correct location of file',
	options: {
		plugins: [
			{
				transform(source) {
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
		binding: 'default',
		code: 'MISSING_EXPORT',
		exporter: ID_EMPTY,
		id: ID_MAIN,
		url: 'https://rollupjs.org/troubleshooting/#error-name-is-not-exported-by-module',
		pos: 44,
		loc: {
			column: 7,
			file: ID_MAIN,
			line: 1
		},
		frame: `
			1: import a from './empty.js';
			          ^
			2:
			3: Object.assign({}, a);
		`,
		watchFiles: [ID_EMPTY, ID_MAIN],
		message: 'main.js (1:7): "default" is not exported by "empty.js", imported by "main.js".'
	}
});
