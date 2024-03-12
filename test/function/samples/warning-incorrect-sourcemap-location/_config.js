const { join } = require('node:path');
const ID_MAIN = join(__dirname, 'main.js');
const ID_CONSTANTS = join(__dirname, 'constants.js');

module.exports = defineTest({
	description: 'does not fail if a warning has an incorrect location due to missing sourcemaps',
	options: {
		plugins: [
			{
				name: 'test',
				transform(code) {
					return '/* injected */;\n\n\n\n\n\n\n\n' + code;
				}
			}
		]
	},
	warnings: [
		{
			binding: 'NON_EXISTENT',
			code: 'MISSING_EXPORT',
			exporter: ID_CONSTANTS,
			frame: '',
			id: ID_MAIN,
			loc: {
				column: 15,
				file: ID_MAIN,
				line: 12
			},
			message:
				'main.js (12:15): "NON_EXISTENT" is not exported by "constants.js", imported by "main.js".',
			pos: 111,
			url: 'https://rollupjs.org/troubleshooting/#error-name-is-not-exported-by-module'
		}
	]
});
