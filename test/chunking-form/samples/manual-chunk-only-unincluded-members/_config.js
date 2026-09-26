const warning = {
	code: 'EMPTY_MANUAL_CHUNK',
	level: 'warn',
	message:
		'Manual chunk "vendor" was not generated as none of its modules are included in the bundle.',
	names: ['vendor']
};

module.exports = defineTest({
	description:
		'does not generate a chunk for a manual chunk whose only member is a tree-shaken re-export barrel and warns instead',
	expectedWarnings: ['EMPTY_MANUAL_CHUNK'],
	logs: new Array(4).fill(warning),
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				vendor: ['lib/index.js']
			}
		}
	}
});
