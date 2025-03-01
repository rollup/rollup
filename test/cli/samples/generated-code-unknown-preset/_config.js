const { assertIncludes } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'overrides the generatedCode option when using presets',
	command: 'rollup main.js --format es --generatedCode unknown',
	error: () => true,
	stderr: stderr => {
		assertIncludes(
			stderr,
			'[!] RollupError: Invalid value "unknown" for option "output.generatedCode" - valid values are "es2015" and "es5". You can also supply an object for more fine-grained control.\n' +
				'https://rollupjs.org/configuration-options/#output-generatedcode'
		);
	}
});
