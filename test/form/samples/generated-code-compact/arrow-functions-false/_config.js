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
			compact: true,
			dynamicImportInCjs: false,
			generatedCode: { arrowFunctions: false },
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
			globals: id => id,
			name: 'bundle',
			noConflict: true,
			systemNullSetters: false
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
