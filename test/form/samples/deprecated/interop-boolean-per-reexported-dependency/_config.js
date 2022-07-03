module.exports = {
	description: 'allows to configure the interop type per reexported external dependency',
	options: {
		strictDeprecations: false,
		external: id => id.startsWith('external'),
		output: {
			interop(id) {
				return JSON.parse(id.split('-')[1]);
			},
			globals(id) {
				return id.replace('-', '');
			},
			name: 'bundle'
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
};
