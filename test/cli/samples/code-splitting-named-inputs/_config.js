const assert = require('node:assert');

module.exports = defineTest({
	description: 'allows defining names via CLI',
	command:
		'rollup --entryFileNames [name]-[hash].js --input entry1=main1.js -i "Entry 2"="main 2.js" -i "main3.js"  -f es',
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
