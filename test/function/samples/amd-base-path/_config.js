module.exports = {
	description: 'throws when using only amd.basePath option',
	options: {
		output: { dir: 'dist', amd: { basePath: 'a' } }
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value for option "output.amd.basePath" - this option only works with "output.amd.autoId".',
		url: 'https://rollupjs.org/guide/en/#outputamd'
	}
};
