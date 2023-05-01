module.exports = defineTest({
	description: 'external paths (#754)',
	options: {
		external: ['foo'],
		output: {
			globals: { foo: 'foo' },
			paths: id => `https://unpkg.com/${id}`
		}
	}
});
