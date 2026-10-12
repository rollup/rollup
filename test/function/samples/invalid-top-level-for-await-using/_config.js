const path = require('node:path');

module.exports = defineTest({
	// SWC reports the declarator start of using declarations in for-of heads at the keyword
	verifyAst: false,
	description: 'rejects CommonJS output for await using in a for-of loop head',
	generateError: {
		code: 'INVALID_TLA_FORMAT',
		id: path.join(__dirname, 'main.js'),
		message:
			'Module format "cjs" does not support top-level await. Use the "es" or "system" output formats rather.'
	}
});
