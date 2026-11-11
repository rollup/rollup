module.exports = defineTest({
	description: 'preserves `this` in JSX member expressions and rewrites it at the top level',
	expectedWarnings: ['THIS_IS_UNDEFINED'],
	options: {
		jsx: 'preserve'
	}
});
