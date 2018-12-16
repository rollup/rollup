module.exports = {
	// TODO Lukas do not inline execution list for preserve modules
	description: 'Preserve modules properly handles internal namespace imports (#2576)',
	options: {
		input: ['main.js'],
		experimentalPreserveModules: true
	}
};
