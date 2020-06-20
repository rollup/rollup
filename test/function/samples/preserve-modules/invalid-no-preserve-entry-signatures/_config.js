module.exports = {
	description: 'throws when setting preserveEntrySignatures to false',
	options: {
		input: ['main.js'],
		preserveEntrySignatures: false,
		output: { preserveModules: true }
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'Setting "preserveEntrySignatures" to "false" is not supported for "output.preserveModules".'
	}
};
