module.exports = {
	description: 'uses correct interop per chunk when importing from external modules',
	options: {
		external: module => module.includes('external'),
		input: ['main-default.js', 'main-named.js', 'main-namespace']
	}
};
