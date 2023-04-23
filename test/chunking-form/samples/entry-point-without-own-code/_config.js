module.exports = defineTest({
	description: 'Handles entry points that contain no own code except imports and exports',
	options: {
		input: ['main.js', 'm1.js', 'm2.js']
	}
});
