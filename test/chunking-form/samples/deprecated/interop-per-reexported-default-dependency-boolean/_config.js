module.exports = {
	description:
		'allows to configure the interop type per reexported default from an external dependency for boolean values',
	options: {
		strictDeprecations: false,
		input: ['false', 'true'],
		external: id => id.startsWith('external'),
		output: {
			interop(id) {
				return JSON.parse(id.split('-')[1]);
			}
		}
	}
};
