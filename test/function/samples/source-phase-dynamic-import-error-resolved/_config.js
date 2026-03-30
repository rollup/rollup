const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws for non-external dynamic source phase imports with dynamic attributes',
	options: {
		plugins: [
			{
				name: 'test',
				resolveDynamicImport(specifier) {
					if (specifier?.type === 'Identifier' && specifier.name === 'dynamic') {
						return { id: 'dynamic' };
					}
				}
			}
		]
	},
	error: {
		code: 'NON_EXTERNAL_SOURCE_PHASE_IMPORT',
		message:
			'Source phase import "dynamic" in "main.js" must be external. Source phase imports are only supported for external modules. Use the "external" option to mark this module as external.',
		url: 'https://rollupjs.org/es-module-syntax/#source-phase-import',
		watchFiles: [ID_MAIN]
	}
});
