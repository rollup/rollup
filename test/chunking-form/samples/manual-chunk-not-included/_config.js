const warning = {
	code: 'EMPTY_MANUAL_CHUNK',
	level: 'warn',
	message:
		'Manual chunk "manual" was not generated as none of its modules are included in the bundle.',
	names: ['manual'],
	url: 'https://rollupjs.org/configuration-options/#output-manualchunks'
};

module.exports = defineTest({
	description:
		'does not generate manual chunks if none of their modules is included in the bundle and instead warns',
	expectedWarnings: ['EMPTY_MANUAL_CHUNK'],
	logs: new Array(4).fill(warning),
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				manual: ['manual-entry.js']
			}
		}
	}
});
