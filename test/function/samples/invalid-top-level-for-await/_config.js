const path = require('node:path');

module.exports = defineTest({
	description: 'rejects CommonJS output for a top-level for-await loop',
	generateError: {
		code: 'INVALID_TLA_FORMAT',
		id: path.join(__dirname, 'main.js'),
		message:
			'Module format "cjs" does not support top-level await. Use the "es" or "system" output formats rather.'
	}
});
