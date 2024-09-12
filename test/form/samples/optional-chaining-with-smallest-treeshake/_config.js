module.exports = defineTest({
	description: 'preserve optional chaining with smallest treeshake',
	options: {
		treeshake: 'smallest'
	}
});
