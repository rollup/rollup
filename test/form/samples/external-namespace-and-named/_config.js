module.exports = defineTest({
	description: 'Correctly handles external namespace tracing with both namespace and named exports',
	options: {
		external: ['foo'],
		output: {
			globals: { foo: 'foo' }
		}
	}
});
