const path = require('path');

module.exports = {
	description: 'warns about use of eval',
	warnings: [
		{
			code: 'EVAL',
			id: path.resolve(__dirname, 'main.js'),
			message: `Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification`,
			pos: 13,
			loc: {
				column: 13,
				file: require('path').resolve(__dirname, 'main.js'),
				line: 1
			},
			frame: `
				1: var result = eval( '1 + 1' );
				                ^
			`,
			url: 'https://rollupjs.org/guide/en/#avoiding-eval'
		}
	]
};
