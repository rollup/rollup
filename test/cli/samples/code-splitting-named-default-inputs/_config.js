const assert = require('node:assert');

module.exports = defineTest({
	description: 'allows defining names via CLI',
	command:
		'rollup entry1=main1.js "Entry 2"="main 2.js" "main3.js" --entryFileNames [name]-[hash].js -f es',
	result(code) {
		assert.equal(
			code,
			'\n' +
				`//→ entry1-F7XBegnP.js:\n` +
				"console.log('main1');\n" +
				'\n' +
				`//→ Entry 2-DJUOC_be.js:\n` +
				"console.log('main2');\n" +
				'\n' +
				`//→ main3-CcbE82tV.js:\n` +
				"console.log('main3');\n"
		);
	}
});
