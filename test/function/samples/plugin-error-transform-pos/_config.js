const path = require('node:path');

module.exports = defineTest({
	description: '`this.error(...)` accepts number as second parameter (#5044)',
	options: {
		plugins: [
			{
				name: 'plugin1',
				transform(code) {
					return code + 'bar';
				}
			},
			{
				name: 'plugin2',
				transform() {
					this.error(new Error('error'), 26);
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		message: 'error',
		plugin: 'plugin2',
		hook: 'transform',
		id: path.join(__dirname, 'main.js'),
		watchFiles: [path.join(__dirname, 'main.js')],
        frame: "1: export const foo = 'foo'bar\n                             ^",
        loc: {
            column: 26,
            file: path.join(__dirname, 'main.js'),
            line: 1
        },
        pos: 26
	}
});
