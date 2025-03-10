const { assertIncludes } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'overrides the treeshake option when using presets',
	command: 'rollup main.js --format es --treeshake unknown',
	error: () => true,
	stderr: stderr => {
		assertIncludes(
			stderr,
			'[!] RollupError: Invalid value "unknown" for option "treeshake" - valid values are false, true, "recommended", "safest" and "smallest". You can also supply an object for more fine-grained control.\n' +
				'https://rollupjs.org/configuration-options/#treeshake'
		);
	}
});
