const assert = require('node:assert');

module.exports = defineTest({
	description: 'respects the NO_COLOR environment variable',
	spawnArgs: ['-i', 'main1.js', '-i', 'main2.js', '-f', 'es'],
	env: { FORCE_COLOR: undefined, NO_COLOR: true },
	result(code) {
		assert.equal(
			code,
			'\n' +
				'//→ main1.js:\n' +
				"console.log('main1');\n" +
				'\n' +
				'//→ main2.js:\n' +
				"console.log('main2');\n"
		);
	}
});
