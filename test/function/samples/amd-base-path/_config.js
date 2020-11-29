module.exports = {
	description: 'throws when using only amd.basePath option',
	options: {
		output: { dir: 'dist', amd: { basePath: 'a' } }
	},
	generateError: {
		code: 'INVALID_OPTION',
		message: '"output.amd.basePath" only works with "output.amd.autoId".'
	}
};
