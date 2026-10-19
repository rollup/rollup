const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'includes the current source location for transform errors at position zero',
	options: {
		plugins: [
			{
				name: 'prepend',
				transform(code) {
					return `const prepended = true;\n${code}`;
				}
			},
			{
				name: 'test',
				transform() {
					this.error(new Error('error at start'), 0);
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		frame: `
			1: const prepended = true;
			   ^
			2: export const value = 1;`,
		hook: 'transform',
		id: ID_MAIN,
		loc: {
			column: 0,
			file: ID_MAIN,
			line: 1
		},
		message: 'error at start',
		plugin: 'test',
		pos: 0,
		watchFiles: [ID_MAIN]
	}
});
