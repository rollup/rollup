module.exports = defineTest({
	description: 'throws when setting preserveEntrySignatures to false',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		preserveModules: true,
		preserveEntrySignatures: false
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value for option "preserveEntrySignatures" - setting this option to false is not supported for "output.preserveModules".',
		url: 'https://rollupjs.org/configuration-options/#preserveentrysignatures'
	}
});
