module.exports = {
	description: 'allows to configure the "type" assertion via a shorthand',
	options: {
		external: true,
		output: {
			name: 'bundle',
			externalImportAssertions: {
				'.json': null,
				'.css': 'css',
				'.foo': 'special',
				'': 'empty'
			}
		}
	}
};
