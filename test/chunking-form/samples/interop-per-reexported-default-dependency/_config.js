module.exports = defineTest({
	description:
		'allows to configure the interop type per reexported default from an external dependency',
	options: {
		input: ['default', 'defaultOnly', 'esModule', 'auto'],
		external: id => id.startsWith('external'),
		output: {
			interop(id) {
				return id.split('-')[1];
			}
		}
	}
});
