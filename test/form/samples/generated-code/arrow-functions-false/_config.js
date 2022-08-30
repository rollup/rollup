module.exports = {
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
			name: 'bundle',
			noConflict: true
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
};
