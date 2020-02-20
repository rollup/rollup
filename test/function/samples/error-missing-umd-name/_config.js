module.exports = {
	description: 'throws an error if no name is provided for a UMD bundle',
	options: { output: { format: 'umd' } },
	generateError: {
		code: 'MISSING_NAME_FOR_EXPORT',
		message: 'You must supply "output.name" for UMD bundles.'
	}
};
