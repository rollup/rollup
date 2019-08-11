module.exports = {
	description: 'external `export *` must not interfere with internal exports',
	options: {
		output: { name: 'exposedInternals' },
		external: ['external']
	}
};
