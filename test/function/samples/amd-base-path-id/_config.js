module.exports = {
	description: 'throws when using both the amd.basePath and the amd.id option',
	options: {
		output: { dir: 'dist', amd: { basePath: 'a', id: 'a' } }
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value for option "output.amd.id" - this option cannot be used together with "output.amd.autoId"/"output.amd.basePath".',
		url: 'https://rollupjs.org/guide/en/#outputamd'
	}
};
