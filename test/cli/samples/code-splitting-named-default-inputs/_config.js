const assert = require('assert');

module.exports = {
	description: 'allows defining names via CLI',
	command:
		'rollup entry1=main1.js "Entry 2"="main 2.js" "main3.js" --entryFileNames [name]-[hash].js -f es',
	result(code) {
		assert.equal(
			code,
			'\n' +
				`//→ entry1-108734151.js:\n` +
				"console.log('main1');\n" +
				'\n' +
				`//→ Entry 2-b2b9d0bf7.js:\n` +
				"console.log('main2');\n" +
				'\n' +
				`//→ main3-064cd134a.js:\n` +
				"console.log('main3');\n"
		);
	}
};
