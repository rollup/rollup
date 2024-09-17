module.exports = defineTest({
	description: 'Keep the code that declares the value of foo',
	options: {
		treeshake: 'smallest'
	}
});
