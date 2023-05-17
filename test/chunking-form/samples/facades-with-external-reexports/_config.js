module.exports = defineTest({
	description: 'ignores external reexports of other entries when finding facades',
	options: {
		external: ['external'],
		input: ['main.js', 'other.js']
	},
	expectedWarnings: ['CIRCULAR_DEPENDENCY']
});
