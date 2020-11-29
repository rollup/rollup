module.exports = {
	description: 'throws when using both the amd.basePath and the amd.id option',
	options: {
		output: { dir: 'dist', amd: { basePath: 'a', id: 'a' } }
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'"output.amd.autoId"/"output.amd.basePath" and "output.amd.id" cannot be used together.'
	}
};
