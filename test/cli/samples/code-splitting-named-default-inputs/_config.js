const assert = require('assert');

module.exports = {
	description: 'allows defining names via CLI',
	command:
		'rollup entry1=main1.js "Entry 2"="main 2.js" "main3.js" --entryFileNames [name]-[hash].js -f es',
	result(code) {
		assert.equal(
			code,
			'\n' +
				`//→ entry1-b70571c1.js:\n` +
				"console.log('main1');\n" +
				'\n' +
				`//→ Entry 2-cc781491.js:\n` +
				"console.log('main2');\n" +
				'\n' +
				`//→ main3-5e259623.js:\n` +
				"console.log('main3');\n"
		);
	}
};
