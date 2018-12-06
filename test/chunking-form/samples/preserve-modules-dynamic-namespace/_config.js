module.exports = {
	// TODO Lukas for preserve modules, do not create namespace objects
	// TODO Lukas do not inline execution list for preserve modules
	skip: true,
	description: 'Preserve modules properly handles internal namespace imports (#2576)',
	options: {
		input: ['main.js'],
		experimentalPreserveModules: true
	}
};
