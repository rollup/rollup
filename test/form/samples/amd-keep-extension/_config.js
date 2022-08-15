module.exports = {
	description: 'keep extension for AMD modules',
	options: {
		external: ['./foo', 'baz/quux'],
		output: { interop: 'default', amd: { keepExtension: true } }
	}
};
