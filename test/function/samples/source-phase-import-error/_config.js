const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws for non-external source phase imports',
	error: {
		code: 'NON_EXTERNAL_SOURCE_PHASE_IMPORT',
		message:
			'Source phase import "./dep.js" in "main.js" must be external. Source phase imports are only supported for external modules. Use the "external" option to mark this module as external.',
		watchFiles: [ID_MAIN]
	}
});
