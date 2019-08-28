const assert = require('assert');

const COLOR = '\u001b[36m\u001b[1m';
const STANDARD = '\u001b[22m\u001b[39m';

module.exports = {
	description: 'allows defining names via CLI',
	command:
		'rollup entry1=main1.js "Entry 2"="main 2.js" "main3.js" --entryFileNames [name]-[hash].js -f es',
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
				`${color}//→ entry1-b70571c1.js:${standard}\n` +
				"console.log('main1');\n" +
				'\n' +
				`${color}//→ Entry 2-cc781491.js:${standard}\n` +
				"console.log('main2');\n" +
				'\n' +
				`${color}//→ main3-5e259623.js:${standard}\n` +
				"console.log('main3');\n"
		);
	}
};
