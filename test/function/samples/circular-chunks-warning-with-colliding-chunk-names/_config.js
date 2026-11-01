module.exports = defineTest({
	description:
		'names the non-manual chunk in the circular chunk warning when its name collides with a manual chunk name',
	options: {
		output: {
			manualChunks(id) {
				if (id.endsWith('a.js') || id.endsWith('c.js')) return 'b';
			}
		}
	},
	warnings: [
		{
			code: 'CIRCULAR_CHUNK',
			ids: ['b', 'b', 'b'],
			message:
				'Circular chunk: b -> b -> b. Please consider disabling the "output.onlyExplicitManualChunks" option, as enabling it causes modules located between the modules included in the manual chunk "b" to be extracted into the separate chunk "b".'
		}
	]
});
