module.exports = defineTest({
	// TODO This should actually be a funtion test that throws
	solo: true,
	description: 'this ensures the local React variable is not renamed when preserving JSX output',
	options: {
		jsx: 'preserve'
	}
});
