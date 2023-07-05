const path = require('node:path');

const externalModule = path.join(__dirname, 'external.js');

module.exports = defineTest({
	description:
		"throws an error EXTERNAL_MODULES_CANNOT_BE_TRANSFORMED_TO_MODULES for manualChunks' modules that are resolved as an external module by the 'external' option",
	options: {
		external: id => {
			if (id.endsWith('external.js')) {
				return true;
			}
		},
		output: {
			manualChunks: {
				external: [externalModule]
			}
		}
	},
	generateError: {
		code: 'EXTERNAL_MODULES_CANNOT_BE_TRANSFORMED_TO_MODULES',
		message: `${externalModule} is resolved as a module now, but it was an external module before. Please check whether there are conflicts in your Rollup options "external" and "manualChunks", manualChunks cannot include external modules.`
	}
});
