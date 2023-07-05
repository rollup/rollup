const path = require('node:path');

module.exports = defineTest({
	description:
		"throws for manualChunks' modules that are resolved as an external module by the 'external' option",
	options: {
		external: id => {
			if (id.endsWith('external.js')) {
				return true;
			}
		},
		output: {
			manualChunks(id) {
				if (id.endsWith('external.js')) {
					return 'external';
				}
			}
		}
	},
	generateError: {
		code: 'EXTERNAL_MODULES_CANNOT_BE_INCLUDED_IN_MANUAL_CHUNKS',
		message: `"${path.join(
			__dirname,
			'external.js'
		)}" cannot be included in manualChunks because it is resolved as an external module by the "external" option or plugins.`
	}
});
