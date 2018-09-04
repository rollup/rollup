const assert = require('assert');

const COLOR = '\u001b[36m\u001b[1m';
const STANDARD = '\u001b[22m\u001b[39m';

module.exports = {
	description: 'bundles multiple files to stdout while adding file names',
	command: 'rollup -i main1.js -i main2.js -f es',
	result(code) {
		let color = '';
		let standard = '';
		if (code[1] === '\u001b') {
			color = COLOR;
			standard = STANDARD;
		}
		assert.equal(
			code,
			'\n' +
				`${color}//→ main1.js:${standard}\n` +
				"console.log('main1');\n" +
				'\n' +
				`${color}//→ main2.js:${standard}\n` +
				"console.log('main2');" +
				'\n'
		);
	}
};
