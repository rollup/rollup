const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws proper error for circular reexports',
	error: {
		code: 'CIRCULAR_REEXPORT',
		exporter: ID_MAIN,
		message: '"foo" cannot be exported from "main.js" as it is a reexport that references itself.',
		watchFiles: [ID_MAIN]
	}
});
