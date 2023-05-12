module.exports = defineTest({
	description: 'uses correct interop per chunk when reexporting from external modules',
	options: {
		external: module => module.includes('external'),
		input: ['main-default.js', 'main-named.js', 'main-namespace'],
		output: { interop: 'compat' }
	}
});
