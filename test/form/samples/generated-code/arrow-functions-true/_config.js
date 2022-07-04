module.exports = {
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
			generatedCode: { arrowFunctions: true },
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
				return true;
			},
			name: 'bundle',
			noConflict: true
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
};
