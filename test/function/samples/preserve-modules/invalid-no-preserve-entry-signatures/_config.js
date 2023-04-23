module.exports = defineTest({
	description: 'throws when setting preserveEntrySignatures to false',
	options: {
		input: ['main.js'],
		preserveEntrySignatures: false,
		output: { preserveModules: true }
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value for option "preserveEntrySignatures" - setting this option to false is not supported for "output.preserveModules".',
		url: 'https://rollupjs.org/configuration-options/#preserveentrysignatures'
	}
});
