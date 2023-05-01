const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws for invalid top-level-await format',
	generateError: {
		code: 'INVALID_TLA_FORMAT',
		id: ID_MAIN,
		message:
			'Module format "cjs" does not support top-level await. Use the "es" or "system" output formats rather.'
	}
});
