const assert = require('node:assert');

module.exports = defineTest({
	description: 'allows defining names via CLI',
	command:
		'rollup entry1=main1.js "Entry 2"="main 2.js" "main3.js" --entryFileNames [name]-[hash].js -f es',
	result(code) {
		assert.equal(
			code,
			'\n' +
				`//→ entry1-JF9mQsXW.js:\n` +
				"console.log('main1');\n" +
				'\n' +
				`//→ Entry 2-GmuWsq4N.js:\n` +
				"console.log('main2');\n" +
				'\n' +
				`//→ main3-RQC0q0DR.js:\n` +
				"console.log('main3');\n"
		);
	}
});
