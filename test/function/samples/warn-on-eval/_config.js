const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'warns about use of eval',
	warnings: [
		{
			code: 'EVAL',
			id: ID_MAIN,
			message:
				'Use of eval in "main.js" is strongly discouraged as it poses security risks and may cause issues with minification.',
			url: 'https://rollupjs.org/troubleshooting/#avoiding-eval',
			pos: 13,
			loc: {
				column: 13,
				file: ID_MAIN,
				line: 1
			},
			frame: `
				1: var result = eval( '1 + 1' );
				                ^`
		}
	]
});
