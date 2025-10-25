module.exports = defineTest({
	description: 'uses arrow functions',
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
			compact: true,
			dynamicImportInCjs: false,
			generatedCode: { arrowFunctions: true },
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
