module.exports = {
	description: 'throws when setting preserveEntrySignatures to false',
	options: {
		input: ['main.js'],
		preserveModules: true,
		preserveEntrySignatures: false
	},
	error: {
		code: 'INVALID_OPTION',
		message: '"preserveModules" does not support setting "preserveEntrySignatures" to "false".'
	}
};
