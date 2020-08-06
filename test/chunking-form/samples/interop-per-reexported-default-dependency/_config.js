module.exports = {
	description:
		'allows to configure the interop type per reexported default from an external dependency',
	options: {
		input: ['false', 'true', 'default', 'esModule', 'auto'],
		external: id => id.startsWith('external'),
		output: {
			interop(id) {
				const interopType = id.split('-')[1];
				switch (interopType) {
					case 'true':
						return true;
					case 'false':
						return false;
					default:
						return interopType;
				}
			}
		}
	}
};
