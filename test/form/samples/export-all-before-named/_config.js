module.exports = {
	description: 'external `export *` must not interfere with internal exports',
	options: {
		options: { output: { name: 'exposedInternals' } },
		external: ['path']
	}
};
