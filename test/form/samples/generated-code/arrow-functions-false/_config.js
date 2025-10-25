module.exports = defineTest({
	description: 'does not use arrow functions',
	options: {
		external: [
			'external',
			'externalAuto',
			'externalDefault',
			'externalDefaultOnly',
			'externalNoImport'
		],
		strictDeprecations: false,
		output: {
			dynamicImportInCjs: false,
			generatedCode: { arrowFunctions: false },
			globals: id => id,
			interop(id) {
				if (id === 'externalDefault') {
					return 'default';
				}
				if (id === 'externalDefaultOnly') {
					return 'defaultOnly';
				}
				if (id === 'externalAuto') {
					return 'auto';
				}
				return 'compat';
			},
			name: 'bundle',
			noConflict: true,
			systemNullSetters: false
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
