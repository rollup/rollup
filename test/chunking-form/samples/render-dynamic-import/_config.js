const path = require('node:path');

module.exports = defineTest({
	description: 'supports custom rendering for dynamic imports',
	options: {
		plugins: {
			name: 'test-plugin',
			resolveDynamicImport(specifier) {
				if (typeof specifier === 'object' && specifier.name === 'someResolvedVariable') {
					return 'someCustomlyResolvedVariable';
				}
			},
			renderDynamicImport({ customResolution, format, moduleId, targetModuleId }) {
				return {
					left: `${format}SpecialHandler(`,
					right: `, '${path.relative(__dirname, moduleId)}', '${
						targetModuleId && path.relative(__dirname, targetModuleId)
					}', ${customResolution})`
				};
			}
		}
	}
});
