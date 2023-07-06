const path = require('node:path');

const externalModule = path.join(__dirname, 'external.js');

module.exports = defineTest({
	description:
		"throws for manualChunks' modules that are resolved as an external module by plugins",
	options: {
		output: {
			manualChunks: {
				external: [externalModule]
			}
		},
		plugins: [
			{
				resolveId(id) {
					if (id.endsWith('external.js')) {
						return {
							id: externalModule,
							external: true
						};
					}
				}
			}
		]
	},
	generateError: {
		code: 'EXTERNAL_MODULES_CANNOT_BE_INCLUDED_IN_MANUAL_CHUNKS',
		message: `"${externalModule}" cannot be included in manualChunks because it is resolved as an external module by the "external" option or plugins.`
	}
});
