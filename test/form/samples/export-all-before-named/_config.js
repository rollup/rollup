module.exports = defineRollupTest({
	description: 'external `export *` must not interfere with internal exports',
	options: {
		output: {
			globals: { external: 'external' },
			name: 'exposedInternals'
		},
		external: ['external']
	}
});
