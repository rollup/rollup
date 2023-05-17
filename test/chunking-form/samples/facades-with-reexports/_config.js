module.exports = defineTest({
	description: 'ignores reexports of other entries when finding facades',
	options: {
		input: ['main.js', 'other.js', 'third.js']
	},
	expectedWarnings: ['CIRCULAR_DEPENDENCY']
});
